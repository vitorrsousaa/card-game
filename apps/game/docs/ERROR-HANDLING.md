# Error handling (API Game)

Regras para erros em serviços da API do game: usar sempre erros customizados que estendem `AppError`.

## Regra

Em **serviços**, nunca usar **`throw new Error(...)`** genérico. Sempre lançar **erros customizados** que estendem **`AppError`**.

## Motivo

O [errorHandler](apps/game/src/app/utils/error-handler.ts) mapeia `AppError` (e subclasses) para **`statusCode`** e **`message`** na resposta HTTP. Erros genéricos viram **`ServerError`** (500) e perdem contexto para o cliente.

## Como fazer

1. **Criar uma classe por caso de domínio** em `modules/<module>/errors/`, por exemplo:
   - `SessionNotFound` (404)
   - `SessionCreationFailed` (502)
2. Estender **`AppError`** e chamar **`super(message, statusCode)`** no construtor.
3. **Lançar** no service no ponto adequado (ex.: `throw new SessionNotFound()`).

## Onde ficam os erros

- **Módulo sessions**: `apps/game/src/app/modules/sessions/errors/`
  - `session-not-found.ts` — sessão não encontrada (404)
  - `session-creation-failed.ts` — falha na criação de sessão (ex.: engine retornou erro) (502)

## Como o errorHandler trata

- **`AppError`** (e subclasses): retorna `statusCode` e `message` do erro.
- **Demais erros**: logados e convertidos em **`ServerError`** (500).

## Referências

- Base: `apps/game/src/app/errors/app-error.ts`
- Handler: `apps/game/src/app/utils/error-handler.ts`
- Controller: [CONTROLLER-PATTERN.md](./CONTROLLER-PATTERN.md)
- Service: [SERVICE-PATTERN.md](./SERVICE-PATTERN.md)
