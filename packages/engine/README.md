# @repo/engine

Engine do jogo de cartas em **Lua puro**. Comunicação via JSON: uma linha de entrada (stdin) → uma linha de saída (stdout).

## Requisitos

- **Lua 5.1+** instalado e no `PATH` (comando `lua` ou `lua5.4` / `lua5.3` conforme o sistema).

## Uso

```bash
# A partir da raiz do monorepo
cd packages/engine
pnpm run start

# Ou diretamente (com cwd = packages/engine)
echo '{"type":"init"}' | lua src/main.lua
echo '{"type":"step","state":{},"action":{"type":"end_turn"}}' | lua src/main.lua
```

## Protocolo

- **Entrada** (uma linha JSON): `{ "type": "init", "payload": { "seed?", "options?" } }` ou `{ "type": "step", "state": GameState, "action": GameAction }`.
- **Saída** (uma linha JSON): `{ "ok": true, "state": GameState, "events": GameEvent[] }` ou `{ "ok": false, "error": string, "code"?: string }`.

Definições em TypeScript: `apps/game/src/app/interfaces/engine-protocol.ts`.

## Estrutura

- `src/main.lua` — ponto de entrada: lê linha, decodifica JSON, despacha `init`/`step`, escreve resposta.
- `src/json.lua` — lib mínima JSON (encode/decode) em Lua puro, sem dependências externas.

## Próximos passos

- State machine (fases de turno: play → combat → end_turn).
- Ações concretas: `play_card`, `attack`, `end_turn` com validação por fase.
- Modelo de jogadores e cartas (life, hand, board, deck).
