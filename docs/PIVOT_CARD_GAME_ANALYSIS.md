# Análise e Pivot de Monorepo — Card Game (PvE → PvP)

**Projeto:** Artemis → Card Game (Cronomantes do Fluxo Eterno)  
**Objetivo:** Documento técnico para pivotar o monorepo de aplicação web de tarefas/projetos para um jogo de cartas digital turn-based, com backend autoritativo e engine de regras em Lua.

---

## 1. Resumo da Codebase Atual

### 1.1 Visão geral

O monorepo hoje é um **template de aplicação web** com:

- **apps/api**: Backend serverless (AWS Lambda + API Gateway), domínio de **projetos**, **seções** e **todos** (gestão de tarefas).
- **apps/spa**: Frontend Vite + React (dashboard de tarefas, projetos, inbox, goals).
- **apps/web**: Frontend Next.js (auth signin/signup + dashboard básico).
- **apps/cli**: CLI interna (comandos, ex.: cosmos).
- **packages**: `contracts`, `logger`, `typescript-config`, `ui`, `vitest-preset`.

A arquitetura da API segue **Clean Architecture** (domain → data protocols → app modules → infra → server), com repositórios DynamoDB, factories de DI e handlers Lambda que adaptam request/response. Não há Terraform; a infra é definida via **Serverless Framework** (`serverless.yml`). Não existe hoje nenhum código de jogo, WebSocket ou matchmaking.

### 1.2 Estrutura atual (resumida)

```
artemis/
├── apps/
│   ├── api/          # Lambda: projects, sections, todos
│   ├── cli/          # Ferramentas internas
│   ├── spa/          # Vite + React (task management)
│   └── web/          # Next.js (auth + dashboard)
├── packages/
│   ├── contracts/    # Tipos request/response (todo, etc.)
│   ├── logger/       # Logger compartilhado
│   ├── typescript-config/
│   ├── ui/           # shadcn-style components
│   └── vitest-preset/
├── .github/workflows/ci.yml
├── pnpm-workspace.yaml
├── turbo.json
├── biome.json
├── lefthook.yml
└── .cursor/rules/    # Padrões (Clean Arch, imports, etc.)
```

---

## 2. O Que Pode Ser Reaproveitado

### 2.1 Estrutura do monorepo

- **pnpm workspaces** + **Turbo**: já configurados; basta incluir `apps/game-server`, `apps/web` (ou renomear/consolidar frontend), `packages/engine` (ou similar) no `pnpm-workspace.yaml` e nas tasks do `turbo.json`.
- **Organização de pastas**: convenção `apps/*` e `packages/*` permanece; apenas nomes e conteúdo dos apps mudam.

### 2.2 Ferramentas de build e qualidade

- **Biome**: lint e format já no root; continua válido para TS/JS/Lua (Biome suporta Lua); pode ser estendido para o novo app e pacotes.
- **Lefthook**: pre-commit (lint, format), pre-push (typecheck), commit-msg (commitlint); manter para garantir qualidade no código do game server e frontend.
- **Commitlint**: convenção de commits; manter.
- **TypeScript**: `packages/typescript-config` com base, react-library, nextjs; reutilizar para `game-server` e frontend do jogo.
- **Vitest**: presets em `packages/vitest-preset` (browser, node); usar no game server (Node) e no frontend; testes da engine Lua podem ser em Lua ou via bridge.

### 2.3 Pipelines de CI/CD

- **.github/workflows/ci.yml**: setup pnpm/Node, cache de deps, build com `ci:build`, matriz de quality-checks (format, lint, typecheck, tests), upload de artifacts. **Reaproveitar o fluxo**; adicionar no build os novos targets (`game-server`, `web` como frontend do jogo, `packages/engine` se for TS wrapper da Lua).

### 2.4 Infraestrutura como código

- **Serverless Framework** (`apps/api/serverless.yml`): provider AWS, runtime Node 20, serverless-offline, serverless-esbuild. **Reaproveitar para as Lambdas que continuam**: auth, usuários, inventário, loja, rankings, histórico de partidas, matchmaking, configurações. O mesmo padrão de `functions:` + handlers pode ser mantido; apenas o domínio das funções muda (de projects/todos/sections para usuário, sessão, inventário, etc.).

### 2.5 Padrões arquiteturais da API

- **Clean Architecture** (domain → data → app → infra → server): excelente para o **novo app Lambda** (api). Controllers, services, repositórios por domínio, factories de DI e adapters request/response podem ser o modelo para novos módulos (auth, user, inventory, shop, ranking, matchmaking).
- **Interfaces de repositório** em `data/protocols`: padrão para qualquer novo agregado (User, Inventory, Match, etc.).
- **Handlers Lambda** que só adaptam evento → controller → response: mesmo padrão para novas rotas HTTP.

### 2.6 Pacotes compartilhados

- **@repo/logger**: já usado pela API; o **game server** (Node) pode usar o mesmo logger para sessões, engine e rede.
- **@repo/typescript-config**: base para game-server e frontend.
- **@repo/ui**: componentes (Button, Card, Dialog, etc.); o frontend do jogo pode reutilizar para menus, configurações, loja, perfil; a **área de jogo** (board, cartas, animações) provavelmente terá componentes específicos.
- **@repo/contracts**: hoje só todo/create e todo/inbox; **evoluir** para contratos de auth, user, game session, inventário, loja, ranking, etc. O game server pode consumir tipos compartilhados (ex.: sessão, estado do jogo, ações) em um subpath como `@repo/contracts/game`.
- **@repo/vitest-preset**: testes no game server e no frontend.

### 2.7 Autenticação e sessão (parcial)

- **Frontend**: `AuthContext`, token em localStorage, `httpClient` com interceptor `Authorization: Bearer`; **reaproveitar** o fluxo de “usuário logado” e chamadas autenticadas; a fonte do token (OAuth, Cognito, etc.) pode ser a mesma para o jogo.
- **API**: `requestAdapter` já lê `userId` do JWT (`authorizer.jwt.claims.sub`) com fallback para `MOCK_USER_ID`; quando auth real estiver implementada nas Lambdas, o mesmo mecanismo serve para rotas de usuário/inventário/ranking.

### 2.8 Documentação e regras

- **.cursor/rules**: project-standards, clean-architecture, import-standards, react-patterns; manter e estender para o game server (ex.: regra de que a engine não acessa DB/rede).
- **docs/**: estrutura de docs (architecture, database-design, contracts-package, backlog); **reaproveitar** o estilo e criar novos docs para: modelo de dados do jogo, contrato da engine, API do game server.

---

## 3. O Que Precisa Ser Alterado

### 3.1 Estrutura dos apps

- **apps/api**: manter como app de Lambdas, mas **remover** (ou deprecar) domínio de projects/sections/todos; **adicionar** domínios de: usuário, autenticação, inventário, loja, ranking, histórico de partidas, matchmaking, configurações globais. Ou seja: mesma estrutura de pastas (modules, controllers, services, infra), novo domínio.
- **apps/spa** vs **apps/web**: hoje há dois frontends (SPA Vite para tarefas, Web Next.js para auth/dashboard). Para o card game, **unificar** em um único frontend (sugestão: **apps/web** como frontend do jogo, ou renomear **spa** → **web** e migrar para Next se fizer sentido). O conteúdo passa a ser: auth, lobby, partida (board, cartas, turnos), perfil, loja, rankings, configurações.
- **Naming e domínio**: trocar referências de “projects/todos/sections” para o domínio do jogo (deck, match, card, player, etc.) nos novos módulos; o nome do serviço no `serverless.yml` e recursos AWS pode ser atualizado (ex.: de `ProjectName` para algo como `artemis-api` ou `cardgame-api`).

### 3.2 Separação de responsabilidades

- **API (Lambdas)**: não deve conter lógica de gameplay; apenas serviços de suporte (auth, user, inventory, shop, ranking, matchmaking, match history). A “autoridade” do estado do jogo fica no **game server**.
- **Game server (novo)**: único responsável por executar a engine, manter estado da partida em memória e responder a ações do cliente (HTTP agora, WebSocket depois). Não deve implementar loja, ranking ou auth; apenas consome identidade (userId) e eventualmente chama a API para validar inventário/sessão se necessário.

### 3.3 API atual vs API necessária para gameplay

- **Remover ou descontinuar**: rotas de projects, sections, todos (ou mover para outro serviço se ainda forem úteis).
- **Manter/evoluir**: padrão de rotas REST, adapters, validação (Zod), erro (AppError, responseAdapter).
- **Novas rotas (Lambdas)**: auth (login, refresh), user (perfil), inventory, shop, ranking, match-history, matchmaking (criar fila, status), config. Contratos dessas rotas podem viver em `@repo/contracts`.
- **Game server**: API própria para gameplay (ex.: `POST /sessions`, `GET /sessions/:id`, `POST /sessions/:id/actions`). Contratos de estado do jogo e ações podem ficar em `@repo/contracts/game` ou em um pacote `shared` (tipos + schemas).

### 3.4 Frontend: estado, renderização, interação

- **Estado**: React Query hoje para projetos/todos; para o jogo, manter React Query para dados de servidor (perfil, inventário, ranking, lista de partidas); estado da **partida atual** (board, mão, turno) pode ser estado local + sincronização via respostas HTTP (e depois WebSocket).
- **Renderização**: layouts e páginas atuais (dashboard, sidebar, projetos) são substituídos por: lobby, tela de partida (board, cartas, recursos, vida), modais de fim de jogo, loja, rankings. Componentes genéricos do `@repo/ui` continuam úteis fora do board.
- **Interação**: de “cliques em tarefas e projetos” para “jogar carta, escolher alvo, fim de turno”; necessidade de componentes de jogo (card component, board, targets, animações) e fluxo de ações → request → atualização de estado.

### 3.5 Modelagem de dados

- **DynamoDB atual**: tabelas/GSIs para Project, Section, Todo (ver `docs/database-design.md`). Para o jogo, novas entidades: User (se ainda não existir), Inventory, Deck, Match (metadados e histórico), MatchmakingQueue, etc. O design de tabelas DynamoDB deve ser refeito para o domínio do jogo; o padrão de repositórios, mappers e factories pode ser o mesmo.
- **Domain (core/)**: entidades Project, Section, Todo serão substituídas (ou coexistir em outro app) por entidades como User, Card, Deck, GameSession (metadados), etc. O “estado da partida” em si (board, vida, recursos, pilhas) é mantido no game server (e opcionalmente persistido em store separado para replay/recovery).

### 3.6 Fluxos de autenticação e sessão

- **Auth**: hoje mock (MOCK_USER_ID); é necessário auth real (Cognito, OAuth, etc.) e propagar JWT para API e, se o game server validar identidade, para o game server (header ou token na criação de sessão).
- **Sessão de jogo**: nova noção de “sessão” (uma partida PvE ou PvP). Criada no game server; pode ser vinculada ao userId; o frontend chama `POST /sessions` (autenticado), recebe `sessionId`, e envia ações em `POST /sessions/:id/actions`. Persistência de sessões (para reconnect ou histórico) pode ser no game server (em memória) + snapshot em DB via Lambda ou job.

---

## 4. O Que Precisa Ser Criado ou Adicionado

### 4.1 App game server (Node.js)

- **Novo app** em `apps/game-server/` (ou `apps/game-server/`): servidor HTTP (Express, Fastify ou similar) que:
  - Cria e gerencia sessões de jogo (em memória, com opção de persistência).
  - Recebe ações do cliente (jogar carta, atacar, fim de turno).
  - Chama a **engine Lua** com (estado_atual, ação) e recebe (novo_estado, eventos).
  - Atualiza estado em memória e retorna novo estado + eventos ao cliente (HTTP JSON; depois WebSocket).
  - Valida que a ação é permitida (e que o cliente é o jogador correto) antes de chamar a engine.
- **Responsabilidades**: não acessa DynamoDB direto para gameplay; pode chamar a API (Lambdas) para validar inventário/deck ou registrar fim de partida. Deve usar **@repo/logger** e **@repo/contracts** (tipos de estado e ações).

### 4.2 Pacote da engine de cartas (Lua)

- **Novo pacote** em `packages/engine/` (ou `packages/game-engine/`):
  - Código **Lua** da engine: regras de turno, resolução de efeitos, cálculo de dano, condições de vitória/derrota. Entrada: estado (JSON ou tabela Lua) + ação; saída: novo estado + lista de eventos.
  - **Sem** I/O: sem DB, sem rede, sem frontend; apenas funções puras (ou determinísticas) para facilitar testes e replay.
  - Estrutura sugerida: `packages/engine/lua/` (ou `src/lua/`) com módulos por conceito (e.g. `state.lua`, `actions.lua`, `effects.lua`, `cards.lua`).

### 4.3 Bridge Node ↔ Lua

- **Dentro do game server ou do pacote engine**: camada que executa Lua a partir do Node.
  - Opções: **lua.vm.js** (Lua em JS/WASM), **fengari** (Lua em JS), **node-lua** (binding para Lua nativo), ou **WASM** (compilar Lua para WASM e usar no Node). A escolha impacta desempenho e facilidade de deploy (ex.: apenas Node, sem binário Lua).
  - Interface: função tipo `runEngine(state, action) → { state, events }`; estado e ação serializados (JSON) de/para Lua.
  - Tratamento de erros: se a engine retornar erro (ação inválida), o game server responde 4xx sem alterar estado.

### 4.4 Modelos de estado do jogo

- **Estado da partida**: estrutura de dados que a engine consome e produz (ex.: jogadores, vida, recursos, mão, board, deck, cemitério, turno, fase). Definir em contrato compartilhado (`@repo/contracts/game` ou `packages/shared`) para frontend, game server e engine (Lua pode receber JSON).
- **Ações**: enum ou union de ações (play_card, attack, end_turn, etc.) com payload; validadas na engine e opcionalmente no game server antes de chamar a engine.

### 4.5 Sistema de eventos de gameplay

- **Eventos**: resultado da engine (ex.: card_played, damage_dealt, turn_ended). Usados pelo frontend para animações e feedback; em fase PvP com WebSocket, o servidor envia eventos em tempo real; em PvE com HTTP, podem vir no corpo da resposta (estado + eventos).
  - Definir formato de eventos no contrato compartilhado.

### 4.6 Organização de cartas, efeitos e regras

- **Dados de cartas**: definições (id, nome, custo, tipo, efeito, texto). Podem viver em JSON/YAML no repositório (ex.: `packages/engine/data/cards/`) e ser carregados pela engine Lua (ou por um loader em Node que injeta no estado). Balanceamento e conteúdo ficam separados da engine (regras genéricas).
- **Efeitos e regras**: implementados na engine Lua (ex.: “invocar seguidor 2/3”, “curar 4”, “absorver 3 de dano”); podem ser dados-driven (cartas referenciam efeitos por id) para facilitar inclusão de novas cartas.

### 4.7 Infra preparada para WebSocket

- **Fase 1 (PvE)**: game server só HTTP; não é necessário WebSocket.
- **Fase futura (PvP)**: mesmo processo (Node) pode abrir um servidor WebSocket (ou usar lib que une HTTP + WS no mesmo port). Manter a interface “estado + eventos” para que apenas o transporte mude (resposta HTTP vs mensagens WS). Infra (ex.: um container ou VM para o game server) deve permitir conexões persistentes; em AWS, pode ser ECS/Fargate ou EC2, não Lambda.

### 4.8 Estratégia de persistência de estado

- **Em memória**: estado ativo da partida no game server; suficiente para PvE e para PvP com sessões curtas.
  - **Recovery/reconnect**: opcionalmente persistir snapshot do estado (ex.: em Redis ou DynamoDB) a cada turno ou em intervalos; em caso de restart do game server, recuperar sessão.
  - **Histórico**: ao fim da partida, o game server (ou o cliente) chama a API (Lambda) para registrar resultado (userId, deck, resultado, duração); Lambda persiste em DynamoDB para ranking e histórico.

### 4.9 Testes da engine de jogo

- **Testes em Lua**: usar framework de teste Lua (ex.: busted, luassert) para funções puras da engine (dado estado X e ação Y, esperado estado Z e eventos W).
  - Pode rodar no CI (script que executa Lua ou que chama a bridge Node→Lua e assere resultados).
- **Testes de integração**: game server + engine (Node chama bridge com estado e ação e verifica resposta); podem usar Vitest no app game-server.

---

## 5. Estrutura Esperada do Monorepo (Proposta)

```
apps/
  web/                 # Frontend do jogo (Next ou Vite; unificar spa/web)
  game-server/         # Node server (HTTP; depois + WebSocket)
  api/                 # Lambdas (auth, user, inventory, shop, ranking, matchmaking, history)

packages/
  engine/              # Engine de cartas: Lua + bridge Node↔Lua (+ dados de cartas)
  shared/              # Tipos, contratos e schemas (estado, ações, eventos) — ou estender contracts
  ui/                  # Componentes reutilizáveis (existente)
  contracts/           # Contratos API REST (auth, user, game meta) — existente, evoluir
  logger/              # Existente
  typescript-config/   # Existente
  vitest-preset/       # Existente

infra/                 # Opcional: Terraform ou CDK para VPC, game server (ECS/EC2), etc.
  terraform/
  scripts/
```

- **Naming**: `shared` pode ser o pacote de tipos de gameplay (estado, ações, eventos); ou manter tudo em `contracts` com subpaths `contracts/game`, `contracts/auth`, etc.
- **apps/web**: pode ser o atual `apps/web` (Next) ou o atual `apps/spa` (Vite) renomeado e adaptado; o importante é um único app de frontend do jogo.

---

## 6. Roadmap Técnico

### Fase 1 — Fundação

- **Ajuste do monorepo**
  - Atualizar `pnpm-workspace` e `turbo.json` para incluir `game-server` e `packages/engine`.
  - Decidir frontend único (web ou spa), renomear e limpar o que não for usado.
  - Manter CI (build, lint, format, typecheck, test) para todos os pacotes e apps relevantes.
- **Engine mínima em Lua**
  - Criar `packages/engine` com Lua puro: estado mínimo (2 jogadores, vida, recursos, mão vazia), uma ação (ex.: end_turn) e retorno (novo estado + evento).
  - Implementar bridge Node↔Lua (ex.: fengari ou lua.vm.js) e função `runEngine(state, action) → { state, events }`.
  - Testes em Lua (e opcionalmente testes em Node que chamam a bridge).
- **Game server básico em Node**
  - Criar `apps/game-server`: servidor HTTP, rota `POST /sessions` (cria sessão, estado inicial via engine), `GET /sessions/:id` (retorna estado), `POST /sessions/:id/actions` (envia ação, chama engine, retorna novo estado + eventos).
  - Estado em memória (Map por sessionId); sem persistência ainda.
  - Usar @repo/logger e tipos de estado/ações em @repo/contracts ou packages/shared.
- **PvE funcional via HTTP**
  - Implementar fluxo mínimo de jogo na engine (ex.: jogador vs “bot” que só passa turno): turno, recursos, uma carta jogável.
  - Frontend: tela de partida que chama game server (criar sessão, enviar ação, exibir estado e eventos).
- **Frontend jogável**
  - Tela de partida: exibir board, mão, recursos, botão “fim de turno” e uma ação de jogar carta; atualizar UI com resposta do servidor (estado + eventos).

### Fase 2 — Qualidade

- **Organização de cartas e efeitos**
  - Definir formato de dados de cartas (JSON/Lua); carregar na engine; implementar efeitos das cartas iniciais (Cronomantes + neutras) conforme IDEIA_CENTRAL.md.
- **Balanceamento**
  - Dados de cartas e números ajustáveis fora do código (arquivos de configuração ou DB de conteúdo).
- **Animações e feedback visual**
  - Usar eventos da engine para disparar animações no frontend (ex.: card_played, damage_dealt).
- **Testes automatizados da engine**
  - Suite de testes Lua para regras e efeitos; testes de integração game-server + engine para ações principais.

### Fase 3 — Escala

- **WebSocket**
  - Adicionar servidor WebSocket no game server; mesmo contrato estado/eventos; cliente subscreve à sessão e recebe atualizações em tempo real.
- **PvP**
  - Matchmaking (Lambda ou serviço) associa dois jogadores; game server cria sessão para dois jogadores e roteia ações de cada um; engine já deve suportar 2 jogadores.
- **Matchmaking**
  - Lambda ou fila (SQS + Lambda) para criar partida e devolver sessionId e endpoint do game server (ou token de conexão WS).
- **Persistência robusta**
  - Snapshot de sessão (Redis/DynamoDB) para reconnect; registro de resultado na API ao fim da partida.
- **Infraestrutura dedicada**
  - Deploy do game server em ECS/Fargate ou EC2; possível auto-scaling por sessões ativas; API (Lambdas) já em AWS.

---

## 7. Decisões Técnicas e Impactos

| Decisão                                           | Impacto                                                                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Engine em Lua, sem I/O                            | Regras testáveis e replay determinístico; exige bridge Node↔Lua e disciplina para manter Lua puro.                      |
| Game server em Node (HTTP primeiro)               | Reaproveita ecossistema (logger, TS, testes); WebSocket depois sem trocar linguagem.                                    |
| Lambdas para auth, loja, ranking                  | Mantém escalabilidade e padrão atual; separação clara entre “metadados e economia” (Lambda) e “gameplay” (game server). |
| Estado da partida em memória                      | Simples para PvE e PvP; persistência opcional para recovery; histórico via API.                                         |
| Contratos compartilhados (estado, ações, eventos) | Type-safety entre frontend, game server e documentação da engine; evolução controlada da API de gameplay.               |
| Um único frontend (web)                           | Menos duplicação de auth e navegação; foco em uma stack (Next ou Vite).                                                 |

---

## 8. Conclusão

O monorepo atual oferece **estrutura, tooling e padrões** fortemente reaproveitáveis: workspaces, Turbo, Biome, Lefthook, CI, Clean Architecture na API, pacotes logger/contracts/ui/vitest-preset. O pivot exige **alterar o domínio** da API (de projetos/todos para usuário, inventário, loja, ranking, matchmaking), **unificar/redirecionar** o frontend para o card game e **adicionar** game server e engine Lua com bridge. A proposta de estrutura (apps web, game-server, api; packages engine, shared, ui, contracts) e o roadmap em três fases (fundação, qualidade, escala) permitem executar o pivot de forma incremental, mantendo clareza arquitetural e base sólida para PvP e crescimento futuro.

---

**Documento gerado com base na análise da codebase em:** 2026-02-08.
