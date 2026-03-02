# Session API

Endpoints de sessão do Game: criar e buscar por ID. Create e Get retornam o mesmo contrato.

## Endpoints

| Método | Rota              | Descrição        |
|--------|-------------------|------------------|
| POST   | `/sessions`       | Criar sessão     |
| GET    | `/sessions/:sessionId` | Buscar sessão por ID |

## Contrato único

Tanto **Create** quanto **Get** retornam o mesmo corpo: **SessionDto**.

- **Create**: `POST /sessions` → `200` com corpo `SessionDto`.
- **Get**: `GET /sessions/:sessionId` → `200` com corpo `SessionDto` ou `404` se não existir.

Isso permite ao cliente usar a mesma tipagem e a mesma forma de exibir/atualizar estado, seja após criar ou ao recarregar a sessão.

### SessionDto

Tipos em `@repo/contracts/game/sessions`:

- `SessionDto`: contrato completo (id, state, userId, createdAt, updatedAt).
- `CreateSessionResponseDto` = `SessionDto`.
- `GetSessionResponseDto` = `SessionDto`.

Campos:

- `id`: string (UUID)
- `state`: GameStateDto (estado do motor Lua)
- `userId`: string | null
- `createdAt`: string (ISO)
- `updatedAt`: string (ISO)
