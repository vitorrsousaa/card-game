# Architecture Patterns — Artemis

Referência de padrões e estrutura de arquitetura do monorepo Artemis.

## Visão geral do monorepo

```
artemis/
├── apps/
│   ├── api/          # Lambda API — auth, usuários, projetos, todos (DynamoDB)
│   ├── spa/          # Frontend SPA — Vite + React (chama api + game)
│   ├── game/         # Game API — sessões de partida, engine Lua, Redis
│   └── cli/          # CLI (ex.: Cosmos)
└── packages/
    ├── contracts/    # Contratos compartilhados (Zod + DTOs) — api, spa, game
    ├── ui/           # Componentes React compartilhados (Tailwind, Radix)
    ├── logger/       # Logger compartilhado (createLogger, níveis)
    ├── engine/       # Engine do jogo em Lua (stdin/stdout JSON)
    ├── typescript-config/  # Configs TS reutilizáveis
    └── vitest-presets/     # Presets Vitest (browser, node)
```

- **Workspace:** `pnpm-workspace.yaml` — `packages: ["apps/*", "packages/*"]`
- **Build/orquestração:** Turbo (`turbo.json`) — tasks: `build`, `lint`, `format`, `typecheck`, `test`, `dev`

---

## Padrão 1: Estrutura de módulo no SPA (Clean Architecture)

Cada feature no frontend segue uma estrutura por módulo com separação **app** (lógica) e **view** (UI).

**Quando usar:** Ao criar ou expandir qualquer feature no `apps/spa` (match, deck, hub, etc.).

**Estrutura:**

```
modules/<feature>/
├── app/
│   ├── entities/     # Entidades de domínio (tipos/interfaces)
│   ├── hooks/        # Hooks (React Query, etc.)
│   └── services/     # Chamadas à API (httpClient / httpGameClient)
└── view/
    ├── components/   # Componentes de UI do módulo
    └── modals/       # Modais (quando aplicável)
```

**Exemplo real (match):**

- `modules/match/app/services/create-session.ts` — chama Game API (`POST /sessions`)
- `modules/match/app/hooks/use-create-session.ts` — hook que usa o service
- Páginas em `view/pages/app/` (hub, match) consomem hooks e componentes

**Benefícios:** Lógica isolada da UI; fácil testar services e hooks; imports claros (`@/modules/...`).

**Path aliases (SPA):** `@/` aponta para `src/` (configurado em `tsconfig.app.json` + `vite.config.ts`).

---

## Padrão 2: Camadas na API Lambda (apps/api)

A API segue **Clean Architecture** com dependências apontando para dentro.

**Camadas (de fora para dentro):**

| Camada            | Pasta                  | Responsabilidade |
|-------------------|------------------------|------------------|
| Presentation      | `server/`              | Handlers Lambda, adapters request/response |
| Application       | `app/modules/`         | Controllers, services (orquestração e regras) |
| Data (contratos)  | `data/protocols/`     | Interfaces de repositório |
| Infrastructure    | `infra/db/dynamodb/`   | Implementação DynamoDB |
| Domain            | `core/domain/`         | Entidades de domínio (sem deps externas) |
| DI                | `factories/`           | Montagem de controllers/services com repos injetados |

**Fluxo de uma requisição (ex.: GET /todos):**

1. API Gateway → `handler.ts` → `requestAdapter(event)` → controller (factory) → `controller.handle(request)`
2. Controller chama `service.execute()`
3. Service usa interface `TodoRepository` (não implementação)
4. Factory injeta `TodoDynamoRepository` no service
5. Response: controller → `responseAdapter` → API Gateway

**Path aliases (API):** `@application/*`, `@server/*`, `@core/*`, `@factories/*`, `@data/*`, `@infra/*` (ver `tsconfig.paths.json`).

**Princípios:** SOLID (especialmente D — inversão de dependência), DDD (domain separado, repositories como abstração).

---

## Padrão 3: Camadas no Game API (apps/game)

O servidor de jogo (Hono, Node) orquestra partidas, engine Lua e Redis.

**Camadas:**

| Camada       | Pasta                | Responsabilidade |
|-------------|----------------------|------------------|
| Server      | `server/`            | App Hono, rotas, middlewares, adapters |
| Application | `app/modules/`       | Controllers, services (sessions, step) |
| Interfaces  | `app/interfaces/`    | Contratos (engine-protocol, sessions-repository, cache-provider) |
| Infra       | `infra/`             | Engine bridge (Lua), Redis sessions repo, cache (memória/Redis) |
| DI          | `factories/`         | Montagem de controllers, services, repositórios |

**Fluxo típico (sessão):**

- `POST /sessions` → CreateSessionController → CreateSessionService → ProcessEngineBridge (Lua init) + SessionsRepository (Redis)
- `GET /sessions/:id` → GetSessionController → GetSessionService → SessionsRepository
- `POST /sessions/:id/step` → StepController → StepService → carrega state do repo → engine step → persiste state → retorna state + events

**Path aliases (Game):** `@application/*`, `@server/*`, `@core/*`, `@factories/*`, `@infra/*`.

---

## Padrão 4: Contratos compartilhados (@repo/contracts)

Contratos ficam entre APIs e SPA para manter validação e tipos alinhados.

**Estrutura do pacote:**

- `packages/contracts/src/` — namespaces: `game/sessions`, `game/cards`, `game/decks`, `game` (re-exports), `common`
- Cada namespace expõe schemas Zod e tipos/DTOs (ex.: `game/sessions/dto.ts`, `game/sessions/index.ts`)
- Build gera `dist/*/index.{js,d.ts}`; consumo via `@repo/contracts/game/sessions`, etc.

**Fluxo de dados:**

- **Backend:** Controller valida com InputSchema (Zod); Service usa Domain; Mapper converte Domain → DTO; resposta tipada com OutputType.
- **SPA:** Service/Hook usam InputType e OutputType; componentes consomem tipos do contracts.
- **Regra:** Schema Zod (validação) → Domain (lógica) → DTO (transporte) → tipos no SPA.

**Quando usar:** Novos endpoints ou fluxos de partida devem definir/atualizar schemas e DTOs em `@repo/contracts` e consumir nos dois lados (api/game e spa).

---

## Padrão 5: Dois clientes HTTP no SPA

O frontend não usa uma única API: separa **plataforma** e **jogo**.

| Necessidade              | API       | Cliente no SPA   | Exemplo |
|--------------------------|-----------|------------------|---------|
| Login, auth, usuário     | Lambda API| `httpClient`     | `VITE_API_BASE_URL` |
| Projetos, todos, listas  | Lambda API| `httpClient`     | idem |
| Criar partida            | Game API  | `httpGameClient` | `POST /sessions` |
| Carregar / step da partida | Game API | `httpGameClient` | `GET/POST /sessions/:id` |

- **httpClient:** `apps/spa/src/app/services/http-client.ts` — base URL: `VITE_API_BASE_URL`
- **httpGameClient:** `apps/spa/src/app/services/http-game-client.ts` — base URL: `VITE_GAME_API_BASE_URL`

**Regra:** Tudo que é plataforma (auth, usuário, DynamoDB) → Lambda. Tudo que é partida (sessão, state, step) → Game API.

---

## Convenções de nomenclatura (Artemis)

- **Arquivos/pastas:** kebab-case — `create-session.ts`, `use-create-session.ts`
- **Componentes:** PascalCase — `ProjectListError`, `NavProjects`
- **Hooks:** camelCase com prefixo `use` — `useGetAllProjects`, `useCreateSession`
- **Funções/constantes:** camelCase; constantes UPPER_SNAKE_CASE — `API_BASE_URL`
- **Interfaces/Tipos:** PascalCase — `Project`, `TodoEntity`

---

## Organização de código

- **Estrutura clara:** separação por camadas (server → app → data/domain → infra) e por módulos (app vs view no SPA).
- **Nomenclatura consistente:** seguir `.cursor/rules/project-standards.mdc`.
- **Documentação:** decisões de arquitetura em `docs/architecture-overview.md`, `apps/api/ARCHITECTURE_DIAGRAM.md`, `apps/game/docs/ARCHITECTURE-DECISIONS.md`.

---

## Anti-patterns a evitar

- **Lambda com lógica de gameplay:** regras de partida (vida, mana, turnos) ficam na engine (Lua) e no Game API, não na Lambda.
- **Game API acessando DynamoDB direto:** persistência de sessões no Redis; dados de plataforma via Lambda ou contrato (ex.: deck vindo do cliente).
- **Um único cliente HTTP no SPA:** manter sempre a separação httpClient (Lambda) vs httpGameClient (Game).
- **Domain dependendo de infra ou apresentação:** dependências devem apontar para dentro; domain não importa de server/infra.

---

## Referências no repositório

- **Visão geral e diagrama:** `docs/architecture-overview.md`
- **API Lambda (camadas e fluxo):** `apps/api/ARCHITECTURE_DIAGRAM.md`
- **Decisões Game ↔ Lambda:** `apps/game/docs/ARCHITECTURE-DECISIONS.md`
- **Padrões de código:** `.cursor/rules/project-standards.mdc`
- **Logging:** `.cursor/rules/logging-standards.mdc`
