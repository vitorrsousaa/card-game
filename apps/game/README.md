# Game API (game-server)

API do jogo de cartas (partidas PvE/PvP). Servidor HTTP com Hono, preparado para WebSocket futuro e comunicação com a engine Lua via processo.

## Docker (Redis + App)

O game server roda em um **stack Docker** (`game-server`) com Redis e a aplicação Node.

### Modos de execução

- **Desenvolvimento (default):** Hot-reload com volumes montados, porta de debug habilitada
- **Produção:** Imagem otimizada, sem volumes, recursos limitados

### Subir tudo (Redis + App) - Desenvolvimento

```bash
# a partir de apps/game
docker compose up -d
```

Isso sobe:
- **Redis** (container `game-server-redis`) na porta `6379`
- **App Node** (container `game-server-app`) na porta `3001` (app) e `9229` (debug)

**Hot-reload:** O código local é montado como volume, então mudanças no código são refletidas automaticamente (tsx watch).

### Subir em modo produção

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile production up -d app-prod
```

### Subir só o Redis

```bash
docker compose up -d redis
```

### Conexão Redis

- **Na sua máquina (host):** `redis://localhost:6379`
- **De dentro do container app:** `redis://redis:6379` (usado automaticamente via env `REDIS_URL`)

### Variáveis de ambiente

O arquivo `.env` já está criado com valores padrão. Para desenvolvimento local (fora do Docker), use `REDIS_URL=redis://localhost:6379`. Dentro do Docker, o `docker-compose.yml` sobrescreve para `redis://redis:6379`.

### Debug no Docker

A porta `9229` está exposta para Node.js debugging. Configure seu IDE para conectar em `localhost:9229`.

### Parar

```bash
docker compose down        # Para containers, mantém volumes
docker compose down -v     # Para containers e remove volumes (perde dados Redis)
```

### Logs

```bash
docker compose logs -f app    # Logs da aplicação
docker compose logs -f redis  # Logs do Redis
docker compose logs -f app-prod  # Logs da app produção (se estiver rodando)
```

### Rebuild da app

```bash
docker compose build app      # Rebuild apenas a app (dev)
docker compose build app-prod  # Rebuild app produção
docker compose up -d --build   # Rebuild e sobe tudo
```

### Recursos (CPU/Memória)

- **App dev:** Limite 1 CPU / 2GB RAM; Reserva 0.25 CPU / 512MB RAM
- **App prod:** Limite 2 CPU / 2GB RAM; Reserva 0.5 CPU / 1GB RAM
- **Redis:** Limite 0.5 CPU / 512MB RAM; Reserva 0.1 CPU / 128MB RAM

## Estrutura (Clean Architecture)

- **app/** – Application layer: interfaces, errors, config, utils, módulos (sessions)
- **server/** – Infra HTTP: adapters (request/response), routes, app Hono, index (server Node)
- **factories/** – DI: controllers e services
- **infra/engine/** – Bridge para a engine Lua (processo, protocolo JSON)

## Rotas

- `POST /sessions` – Cria uma sessão de jogo e retorna um array (por enquanto com stub da engine).

## Engine Lua

A engine vive em `packages/engine` e é chamada via **processo** (stdin/stdout em JSON).

- **Protocolo:** `app/interfaces/engine-protocol.ts` (comandos `init` e `step`, estado e eventos).
- **Bridge:** `IEngineBridge` em `app/interfaces/engine-bridge.ts`. Implementações:
  - `infra/engine/stub-engine-bridge.ts` – stub para desenvolvimento (sem processo).
  - `infra/engine/process-engine-bridge.ts` – chama o binário/script da engine (quando `@repo/engine` existir).

Para usar a engine real, troque em `factories/services/sessions/create-session.ts` para `ProcessEngineBridge` com o caminho do script (ex.: pacote `@repo/engine`).

## Desenvolvimento

```bash
pnpm dev
```

Porta padrão: `3001` (variável `PORT`).

## Teste rápido

```bash
curl -X POST http://localhost:3001/sessions -H "Content-Type: application/json" -d '{}'
```

Resposta esperada: array com um objeto de sessão (id, state, events).
