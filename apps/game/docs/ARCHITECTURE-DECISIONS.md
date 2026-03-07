# Decisões de Arquitetura — Game Server ↔ Lambda API

Este documento analisa a comunicação entre o **game server** (apps/game) e a **API Lambda** (apps/api) para persistir sessions no DynamoDB, e discute renomeação de pastas.

---

## 1. Comunicação Game Server ↔ Lambda API (para salvar session no Dynamo)

### Contexto

- **Game server** (apps/game): roda a engine Lua, gerencia partidas, precisa persistir sessions.
- **Lambda API** (apps/api): já tem acesso ao DynamoDB e segue Clean Architecture.
- **Decisão:** game server vai chamar a Lambda API para salvar/buscar sessions no Dynamo (em vez de escrever direto no Dynamo).

### Opções de comunicação

| Opção | Descrição | Prós | Contras |
|-------|-----------|------|---------|
| **A) HTTP REST (público)** | Lambda API expõe rotas públicas `POST /sessions`, `GET /sessions/:id`, `PUT /sessions/:id` via API Gateway. Game server faz HTTP requests (axios/fetch) para essas rotas. | Simples; usa a mesma API que o frontend; autenticação via JWT se necessário. | Latência extra (API Gateway + Lambda cold start); custo por request; precisa de autenticação se for público. |
| **B) HTTP REST (interno/VPC)** | Mesmo que A, mas as rotas são internas (VPC endpoint ou API Gateway privado). Game server e Lambda na mesma VPC. | Menos latência que público; mais seguro (não exposto na internet). | Requer VPC; mais complexo para dev local; ainda tem cold start. |
| **C) Lambda invoke direto (SDK)** | Game server usa AWS SDK (`lambda.invoke()`) para chamar a função Lambda diretamente (sem API Gateway). | Menor latência (sem API Gateway); mais barato; pode passar payload binário. | Requer credenciais AWS no game server; payload limitado (6MB); ainda pode ter cold start. |
| **D) EventBridge / SQS** | Game server publica eventos; Lambda consome assincronamente. | Desacoplamento; escalável; Lambda processa em batch. | Não é síncrono (não dá para esperar resposta imediata); complexidade de retry/erro. |

### Recomendação

**Para MVP:** **Opção A (HTTP REST público)** com autenticação opcional (ou API key interna). Motivos:

- **Simplicidade:** game server só precisa fazer HTTP requests; não precisa de credenciais AWS ou VPC.
- **Reutilização:** as mesmas rotas podem servir o frontend (GET /sessions/:id para ver histórico).
- **Desenvolvimento:** funciona localmente (game server → API local via serverless-offline ou URL de dev).
- **Evolução:** depois você pode adicionar cache (Redis) no game server ou trocar para Lambda invoke se precisar de menos latência.

**Implementação sugerida:**

1. **Lambda API** (apps/api) cria módulo `sessions`:
   - `POST /sessions` — cria session (recebe `{ state, userId }`, grava no Dynamo, retorna `{ id, ... }`).
   - `GET /sessions/:id` — busca session por ID.
   - `PUT /sessions/:id` — atualiza state da session.

2. **Game server** cria um **client HTTP** (ex.: `infra/api/sessions-client.ts`) que:
   - Faz requests para a URL da API (env `API_BASE_URL`).
   - Opcionalmente envia API key ou JWT no header.
   - Encapsula get/save session.

3. **No CreateSessionService** (game server):
   - Chama Lua init → obtém state com sessionId.
   - Chama `sessionsClient.save({ id: sessionId, state, userId })`.
   - Retorna resposta ao cliente.

**Exemplo de client (game server):**

```typescript
// infra/api/sessions-client.ts
export class SessionsApiClient {
  constructor(private readonly baseUrl: string) {}
  
  async save(session: SessionDto): Promise<void> {
    await fetch(`${this.baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
  }
  
  async get(id: string): Promise<SessionDto | null> {
    const res = await fetch(`${this.baseUrl}/sessions/${id}`);
    if (!res.ok) return null;
    return res.json();
  }
  
  async update(id: string, state: GameState): Promise<void> {
    await fetch(`${this.baseUrl}/sessions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });
  }
}
```

**Para produção:** se a latência do HTTP público for um problema, migrar para **Opção C (Lambda invoke direto)** mantendo a mesma interface (client abstrato que pode trocar implementação).

---

## 2. Renomeação de pastas: game → game-server, api → ?

### Análise

**apps/game → apps/game-server:**

- **Prós:** nome mais descritivo (é um servidor de jogo); alinha com convenção de nomes (game-server vs api).
- **Contras:** precisa atualizar imports, workspace, turbo.json, referências em docs.

**apps/api → ?**

Opções de nome:

| Nome | Descrição | Prós | Contras |
|------|-----------|------|---------|
| **api** (manter) | Nome genérico | Já existe; não precisa mudar nada. | Não deixa claro que é a API de suporte (não gameplay). |
| **platform-api** | API da plataforma (usuários, inventário, loja, etc.) | Deixa claro que é a API de suporte/plataforma. | Mais longo; pode confundir com "plataforma de jogo". |
| **artemis-api** | API do projeto Artemis | Nome do projeto; único. | Genérico demais; não diz o propósito. |
| **backend-api** | API backend | Simples; deixa claro que é backend. | Genérico; não diferencia de game-server. |
| **support-api** | API de suporte | Deixa claro que é suporte (não gameplay). | Pode parecer "suporte técnico". |

### Recomendação

- **apps/game → apps/game-server:** **faz sentido** renomear para deixar claro que é o servidor de partidas. Mas **não é urgente**; pode fazer quando for implementar a persistência (ou em um refactor maior).
- **apps/api:** **manter como `api`** por enquanto. Se no futuro você quiser diferenciar, `platform-api` é uma boa opção, mas só vale a pena se você tiver múltiplas APIs (ex.: game-server, platform-api, admin-api).

**Impacto da renomeação (game → game-server):**

- Atualizar `pnpm-workspace.yaml` (se tiver referência explícita).
- Atualizar `turbo.json` (tasks que referenciam `game`).
- Atualizar imports em outros pacotes (ex.: `@repo/contracts` se importar de `apps/game`).
- Atualizar docs e READMEs.
- Git: `git mv apps/game apps/game-server` (preserva histórico).

**Quando fazer:** sugerido fazer junto com a implementação da persistência (quando você já vai mexer em vários arquivos do game server de qualquer forma).

---

## 3. Resumo

- **Comunicação game ↔ Lambda:** HTTP REST público (Opção A) para MVP; evoluir para Lambda invoke direto se necessário.
- **Renomeação:** `game → game-server` faz sentido mas não é urgente; `api` pode manter ou virar `platform-api` no futuro se fizer sentido.
