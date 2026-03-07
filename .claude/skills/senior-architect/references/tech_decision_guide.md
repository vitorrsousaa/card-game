# Tech Decision Guide — Artemis

Guia de decisões técnicas, stack e configuração do Artemis.

## Visão geral do stack

| Área        | Tecnologia |
|------------|------------|
| **Monorepo** | pnpm workspaces, Turbo |
| **Frontend** | Vite 7, React 19, React Router 7, TanStack React Query |
| **Lambda API** | Node 20, Serverless Framework, serverless-offline (porta 4000), serverless-esbuild |
| **Game API** | Node, Hono, @hono/node-server |
| **Engine** | Lua (packages/engine), comunicação via stdin/stdout JSON |
| **Persistência** | DynamoDB (Lambda), Redis (Game — sessões) |
| **Contratos** | Zod, TypeScript, @repo/contracts |
| **UI compartilhada** | @repo/ui (Tailwind, Radix) |
| **Logging** | @repo/logger (createLogger, níveis) |
| **Lint/format** | Biome (sem ESLint) |
| **Testes** | Vitest (@repo/vitest-presets: browser, node) |

---

## TypeScript

- **Base compartilhada:** `packages/typescript-config/base.json` (strict, ESNext, resolução bundler). Todos os apps/packages estendem essa base.
- **Apps:** Cada app tem `tsconfig.json` + `tsconfig.paths.json` (api, game) ou `tsconfig.app.json` (spa) com path aliases.
- **Contracts:** `packages/contracts/tsconfig.json` — `outDir`: dist, `rootDir`: src; gera `dist/*/index.{js,d.ts}` para subpaths.
- **Uso:** Sempre estender `@repo/typescript-config/base.json` (ou `react-library.json` / `nextjs.json` quando aplicável). Não duplicar opções de strict que já estão na base.

---

## Path aliases por app

**API (apps/api):** `@application/*` → `./src/app/*`, `@server/*` → `./src/server/*`, `@core/*`, `@factories/*`, `@data/*`, `@infra/*`.

**Game (apps/game):** `@application/*`, `@server/*`, `@core/*`, `@factories/*`, `@infra/*`.

**SPA (apps/spa):** `@/` → `src/` (pages, layouts, components, modules, config, etc.) — definido em `tsconfig.app.json` e `vite.config.ts`.

**Imports entre pacotes:** Usar nome do pacote — ex.: `@repo/contracts/game/sessions`, `@repo/ui/button`, `@repo/logger`.

---

## Lint e formatação: Biome

- **Único linter/formatter:** Biome (root `biome.json`). Não há ESLint no repositório.
- **Regras:** organizeImports, linter recommended, regra de a11y para anchors.
- **Comandos:** `pnpm lint`, `pnpm format` (Turbo repassa para os workspaces). Em CI: `ci:lint`, `ci:format`.

---

## Frontend: Vite (não Next.js)

- **SPA:** Aplicação frontend é **Vite 7 + React 19**, não Next.js. Entry: `apps/spa/index.html` → `src/main.tsx` → `App.tsx`.
- **Roteamento:** React Router 7. Rotas e layouts em `src/view/` (router, pages, layouts).
- **Build:** Vite (`vite.config.ts`); path aliases e React plugin configurados. Produção: build estático servido por CDN ou servidor.

---

## Turbo

- **Arquivo:** `turbo.json` na raiz.
- **Tasks:** `build`, `lint`, `ci:lint`, `format`, `ci:format`, `typecheck`, `ci:typecheck`, `test`, `ci:test`, `dev` (persistent, sem cache).
- **Outputs:** `.next/**`, `dist/**` para cache de build. Usar `pnpm build`, `pnpm dev`, etc. a partir da raiz para orquestrar.

---

## Pacotes @repo — quando usar

| Pacote | Quando usar |
|--------|-------------|
| **@repo/contracts** | Tipos e validação compartilhados entre api, game e spa. Sempre que houver contrato de API (input/output), definir schemas e DTOs aqui e consumir nos dois lados. |
| **@repo/ui** | Componentes React reutilizáveis (botões, cards, dialogs, etc.). Usar no SPA; não na API nem no game. |
| **@repo/logger** | Logging em api e game (e onde o SPA precisar). Usar `createLogger("module-name")` e seguir `.cursor/rules/logging-standards.mdc` (error/warn/debug/info). |
| **@repo/engine** | Não importar como lib Node; o game server usa bridge que spawna processo Lua e comunica via stdin/stdout. Alterações de regras de jogo ficam no engine (Lua). |
| **@repo/typescript-config** | Estender em tsconfig (base, react-library, nextjs). |
| **@repo/vitest-presets** | Configuração de testes (browser ou node) nos apps que usam Vitest. |

---

## Variáveis de ambiente

**SPA (apps/spa):** Prefixo `VITE_` para expor ao client.

- `VITE_API_BASE_URL` — base URL da Lambda API (auth, usuário, projetos, todos).
- `VITE_GAME_API_BASE_URL` — base URL do Game API (sessions, step).
- Outras: `VITE_AUTH_*` conforme auth (ex.: OAuth). Validação em `src/app/config/environment.ts` (Zod).

**API (Lambda):** Definidas no Serverless ou em ambiente de deploy (ex.: tabelas DynamoDB, secrets). Não usar prefixo VITE.

**Game:** Porta do servidor, URL da API (se chamar Lambda), Redis, etc. (ex.: `@application/config/environment`). Não expor secrets no client.

---

## Comunicação Game API ↔ Lambda API

- **Decisão documentada:** `apps/game/docs/ARCHITECTURE-DECISIONS.md`.
- **MVP:** HTTP REST público. Game server chama Lambda (ex.: `POST/GET/PUT /sessions`) para persistir sessões no DynamoDB se/quando necessário; mesma API pode servir o frontend.
- **Evolução:** Se latência for problema, considerar Lambda invoke direto (SDK) mantendo interface de client abstrata. Opções VPC, EventBridge/SQS descritas no doc de decisões.
- **Regra atual:** Sessões em tempo de partida ficam no Redis (Game API); dados de plataforma (usuário, inventário, etc.) na Lambda + DynamoDB.

---

## Segurança

- **Input:** Validar sempre com Zod (schemas do contracts) nos controllers (api e game).
- **Autenticação:** Lambda trata login (ex.: Google), JWT, sessão; Game API pode usar auth mock em dev e validar token em produção.
- **APIs públicas:** Não expor dados sensíveis; rotas de partida podem exigir token ou API key conforme decisão de produto.
- **Dependências:** Manter atualizadas; usar pnpm audit e revisar vulnerabilidades.

---

## Escalabilidade e performance

- **Lambda:** Stateless; escalar por concorrência; cold start mitigado com provisioned concurrency se necessário.
- **Game API:** Um processo Node por instância; escalar horizontalmente; Redis como estado de sessão compartilhado.
- **SPA:** Estático; cache de assets via CDN; React Query para cache de dados no client.
- **Medir antes de otimizar:** Usar logs e métricas (logger, CloudWatch, etc.) para identificar gargalos.

---

## Build e deploy

- **Build:** Na raiz: `pnpm build` (Turbo). Por app: `pnpm --filter api build`, etc. API: serverless-esbuild. Game: tsup (`src/server/index.ts`). SPA: Vite build. Contracts: build gera `dist/`.
- **Deploy:** Lambda via Serverless Framework. Game e SPA conforme infra (ex.: Docker, ECS, Vercel, etc.). Não há Docker/Kubernetes obrigatórios no repo; usar conforme necessidade.
- **Ambiente:** Garantir que variáveis (VITE_*, API_BASE_URL, Redis, etc.) estejam configuradas por ambiente.

---

## Referências no repositório

- **Arquitetura geral:** `docs/architecture-overview.md`
- **Decisões Game ↔ Lambda:** `apps/game/docs/ARCHITECTURE-DECISIONS.md`
- **Diagrama API Lambda:** `apps/api/ARCHITECTURE_DIAGRAM.md`
- **Contratos (uso no backend):** `docs/packages/contracts.md`
- **Padrões de código:** `.cursor/rules/project-standards.mdc`
- **Logging:** `.cursor/rules/logging-standards.mdc`
- **Padrões de arquitetura:** `references/architecture_patterns.md` (nesta skill)
- **Workflows de sistema:** `references/system_design_workflows.md` (nesta skill)
