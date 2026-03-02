# Service pattern (API Game)

Padrão para serviços da API do game: interface genérica, tipos em `@repo/contracts`, re-export no index.

## Interface

- Todo service expõe **`IXxxService extends IService<TInput, TOutput>`**.
- **Input** e **Output** vêm de **`@repo/contracts`** (ex.: `game/sessions`), não de interfaces locais no service.

## Implementação

- A classe **`XxxService`** implementa **`IXxxService`**.
- No **`execute`** usa apenas os tipos do contracts (`TInput`, `TOutput`).

## Export (index do service)

No **`index.ts`** do service:

1. Exportar a **classe** e a **interface** do service.
2. Re-exportar **`TInput`** e **`TOutput`** de `@repo/contracts/game/sessions` (ou namespace adequado), para quem importar do módulo do service ter os tipos à mão.

## Exemplos

- **create-session**: `ICreateSessionService extends IService<CreateSessionInput, CreateSessionOutput>`; tipos em `@repo/contracts/game/sessions`; index re-exporta `CreateSessionInput` e `CreateSessionOutput`.
- **get-session**: `IGetSessionService extends IService<GetSessionInput, GetSessionOutput>`; tipos em `@repo/contracts/game/sessions`; index re-exporta `GetSessionInput` e `GetSessionOutput`.

## Referências

- Contratos: `packages/contracts/src/game/sessions/dto.ts`
- Controller: [CONTROLLER-PATTERN.md](./CONTROLLER-PATTERN.md)
- Erros: [ERROR-HANDLING.md](./ERROR-HANDLING.md)
