# System Design Workflows — Artemis

Fluxos de desenho de sistema e de requisição no Artemis.

## Visão geral dos fluxos

1. **Requisição à Lambda API:** API Gateway → handler → controller → service → repository (DynamoDB).
2. **Requisição ao Game API:** SPA ou outro cliente → Hono → routes → controller → service → engine (Lua) e/ou repositório (Redis).
3. **Fluxo de partida no SPA:** Hub → criar sessão (Game API) → página de partida → GET session / POST step (Game API).
4. **Contratos:** Zod (validação) → Domain → DTO → tipos no SPA; APIs e SPA consomem `@repo/contracts`.

---

## Workflow 1: Requisição GET na Lambda API (ex.: GET /todos)

Passo a passo:

1. **HTTP Request** chega ao API Gateway (Lambda).
2. **Handler** (`server/functions/todo/get-todos/handler.ts`):
   - `requestAdapter(event)` — normaliza evento para objeto de request.
   - `makeGetTodosController()` — factory que monta controller com service e repository injetados.
   - `controller.handle(request)` — orquestra a requisição.
   - `responseAdapter(response)` — formata resposta para API Gateway.
3. **Controller** (`app/modules/todo/controllers/get-todos/`):
   - Validação se necessário.
   - Chama `service.execute()`.
   - Trata erros e formata resposta.
4. **Service** (`app/modules/todo/services/get-todos/`):
   - Lógica de negócio.
   - Chama `todoRepository.findAll()` (interface, não implementação).
   - Transforma resultado para formato de saída.
5. **Repository** (interface em `data/protocols/`, implementação em `infra/db/dynamodb/repositories/todo/`):
   - Acessa DynamoDB (ou implementação in-memory para testes).
   - Retorna dados ao service.
6. **Resposta** sobe: service → controller → handler → responseAdapter → **HTTP Response (JSON)**.

**Regra de dependência:** Handler → Factories → Controllers/Services; Services dependem de interfaces de repositório; Infra implementa as interfaces.

---

## Workflow 2: Criar sessão de partida (Game API)

Passo a passo:

1. **SPA:** usuário inicia partida (ex.: Hub → “Start Match”). Hook chama service `createSession(options)`.
2. **Service (SPA):** `modules/match/app/services/create-session.ts` — `httpGameClient.post('/sessions', body)` com tipos de `@repo/contracts/game/sessions`.
3. **Game API:** `POST /sessions` → Hono → `sessions-routes` → CreateSessionController.
4. **CreateSessionService (game):**
   - Chama **ProcessEngineBridge** com comando `init` e opções (ex.: sessionId, jogador).
   - Engine Lua devolve estado inicial (state) via stdout (JSON).
   - Chama **SessionsRepository** (Redis) para persistir `sessionId` + state.
   - Retorna ao cliente `sessionId` e state (ou DTO definido em contracts).
5. **SPA:** recebe resposta, redireciona ou atualiza para página de partida (ex.: `/match/:sessionId`), usando `sessionId` para GET/POST step.

**Persistência:** Redis (key `session:{sessionId}`, value JSON). Game API não acessa DynamoDB para sessões; dados de plataforma vêm do cliente ou da Lambda conforme contrato.

---

## Workflow 3: Carregar partida e executar step (Game API)

**GET /sessions/:id (carregar partida):**

1. SPA: `httpGameClient.get(\`/sessions/${sessionId}\`)`.
2. Game API: GetSessionController → GetSessionService → SessionsRepository.get(sessionId).
3. Redis retorna state; service pode enriquecer ou formatar; resposta tipada com contracts.
4. SPA armazena state (ex.: React Query) e renderiza UI da partida.

**POST /sessions/:id/step (jogar carta / atacar / fim de fase):**

1. SPA envia ação (ex.: `{ action: 'play_card', payload: { ... } }`) com tipos do contracts.
2. Game API: StepController → StepService:
   - Carrega state do SessionsRepository (Redis).
   - Chama ProcessEngineBridge com comando `step`, state atual e ação.
   - Engine Lua devolve novo state e eventos (stdout JSON).
   - StepService persiste novo state no Redis.
   - Retorna state + events ao cliente.
3. SPA atualiza UI com novo state e eventos (animações, feedback).

**Engine Lua:** stateless por request; recebe state + ação e devolve state atualizado + events; não mantém conexão.

---

## Workflow 4: Fluxo de contratos (Zod → Domain → DTO → SPA)

1. **Definição (packages/contracts):**
   - Schemas Zod para input/output (ex.: `CreateSessionInputSchema`, `SessionOutputSchema`).
   - Tipos inferidos: `CreateSessionInput`, `SessionOutput`, etc.
   - DTOs para transporte entre camadas.
2. **Backend (API ou Game):**
   - Controller valida body/params com InputSchema (Zod).
   - Service trabalha com entidades de domínio (ou DTOs internos).
   - Mapper converte domain → DTO de saída; resposta tipada com OutputType do contracts.
3. **SPA:**
   - Services e hooks importam tipos de `@repo/contracts/game/sessions` (ou namespace correspondente).
   - Chamadas HTTP usam InputType para body e esperam OutputType na resposta.
   - Componentes consomem tipos para props e state.

**Benefício:** uma única fonte de verdade para formato e validação; alinhamento entre front e back.

---

## Workflow 5: Quando o frontend chama cada API

| Fluxo / necessidade                    | API usada   | Cliente no SPA   | Exemplo de uso |
|----------------------------------------|------------|------------------|-----------------|
| Login / autenticação                   | Lambda API | `httpClient`     | OAuth, token, sessão |
| Dados do usuário / perfil              | Lambda API | `httpClient`     | Perfil, preferências |
| Projetos, todos, listas                | Lambda API | `httpClient`     | CRUD projetos e tarefas |
| Iniciar partida                        | Game API   | `httpGameClient` | `POST /sessions` |
| Carregar partida                       | Game API   | `httpGameClient` | `GET /sessions/:id` |
| Jogar carta / atacar / fim de fase     | Game API   | `httpGameClient` | `POST /sessions/:id/step` com `action` |

**Resumo:** plataforma (auth, usuário, dados em DynamoDB) → Lambda. Partida (sessão, state, step) → Game API.

---

## Workflow 6: Adicionar nova funcionalidade no SPA (ex.: novo módulo)

1. **Definir contrato:** Se houver novo endpoint ou payload, criar/atualizar schemas e DTOs em `@repo/contracts` (namespace adequado: `game/sessions`, `common`, etc.).
2. **Criar módulo:** Em `apps/spa/src/modules/<feature>/`:
   - `app/entities/` — tipos locais se não vierem só do contracts.
   - `app/services/` — funções que chamam `httpClient` ou `httpGameClient` com tipos do contracts.
   - `app/hooks/` — hooks (ex.: React Query) que usam os services.
   - `view/components/` ou `view/modals/` — UI que consome hooks e tipos.
3. **Integrar na app:** Rotas em `view/router/`, páginas em `view/pages/`, importando hooks e componentes do módulo.
4. **Variáveis de ambiente:** Usar `VITE_API_BASE_URL` ou `VITE_GAME_API_BASE_URL` conforme a API; validar em `app/config/environment.ts` (Zod).

---

## Workflow 7: Adicionar novo endpoint na Lambda API

1. **Contrato:** Garantir que `@repo/contracts` tenha schema de input/output (ou usar contrato existente).
2. **Domain:** Entidade em `core/domain/` se for nova entidade.
3. **Data:** Interface do repositório em `data/protocols/` se houver persistência.
4. **Infra:** Implementação do repositório (ex.: DynamoDB) em `infra/db/dynamodb/repositories/` e factory em `infra/db/dynamodb/factories/`.
5. **App:** Controller e service em `app/modules/<module>/controllers/<use-case>/` e `services/<use-case>/`.
6. **Factories:** `factories/controllers/` e `factories/services/` montando controller com service e service com repository.
7. **Server:** Novo handler em `server/functions/<module>/<use-case>/handler.ts`; registrar no `serverless.yml`.
8. **Adapter:** Usar `requestAdapter` e `responseAdapter` existentes; validar no controller com Zod (schemas do contracts).

---

## Workflow 8: Adicionar nova rota no Game API

1. **Contrato:** Atualizar ou criar schemas em `@repo/contracts` (ex.: `game/sessions`) para request/response.
2. **Interface (se novo recurso):** Ex.: repositório ou engine protocol em `app/interfaces/`.
3. **Infra (se necessário):** Implementação (ex.: novo método no Redis repo ou novo comando na engine).
4. **App:** Controller e service em `app/modules/` (ex.: `sessions`); service usa interfaces (engine bridge, sessions repo).
5. **Factories:** Montar controller e service com dependências injetadas.
6. **Server:** Registrar rota em `server/routes/sessions-routes.ts` (ou novo arquivo de rotas) e conectar ao app Hono em `server/app.ts`.

---

## Troubleshooting de fluxo

- **SPA chama API errada:** Verificar se o fluxo é de plataforma (Lambda) ou de partida (Game) e usar `httpClient` vs `httpGameClient`.
- **Tipos divergentes entre SPA e API:** Garantir que ambos usem os mesmos exports de `@repo/contracts` e que o build do contracts está atualizado (`pnpm build` no root ou no package contracts).
- **Session não encontrada:** Verificar se o Game API está persistindo no Redis e se o `sessionId` usado no GET é o mesmo retornado no POST /sessions.
- **Engine não responde:** Verificar ProcessEngineBridge (stdin/stdout); logs no Game API; formato JSON esperado pelo engine (packages/engine).

---

## Referências

- Diagrama e responsabilidades: `docs/architecture-overview.md`
- Fluxo detalhado Lambda: `apps/api/ARCHITECTURE_DIAGRAM.md`
- Decisões Game ↔ Lambda: `apps/game/docs/ARCHITECTURE-DECISIONS.md`
- Padrões de arquitetura: `references/architecture_patterns.md` (nesta skill)
