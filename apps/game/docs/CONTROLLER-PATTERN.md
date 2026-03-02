# Controller pattern (API Game)

Padrão para controllers e schemas na API do game: validação com `missingFields`, schemas via `@repo/contracts`.

## Padrão do controller

1. **Importar** `missingFields` de `@application/errors/missing-fields`.
2. **Sempre usar** as variáveis **`status`** e **`parsedBody`**:
   ```ts
   const [status, parsedBody] = missingFields(schema, requestBodyOuParams);
   ```
3. **Erro de validação:** `if (!status) return parsedBody;` (nesse caso `parsedBody` é a resposta de erro).
4. **Em seguida:** chamar o service com `parsedBody`.

## Schema e contracts

- Todo schema de controller deve vir de **`@repo/contracts`** (namespace adequado, ex.: `game/sessions`).
- No controller, o arquivo **`schema.ts`** do módulo apenas **re-exporta** o schema do contracts (como em create-session e get-session).
- Ao criar novo endpoint: definir ou reutilizar o schema em `packages/contracts` (seguir [create-contract](.cursor/skills/create-contract/SKILL.md) e [contracts-standards](.cursor/rules/contracts-standards.mdc)); depois re-exportar em `schema.ts`.

## Origem dos dados

- **Body:** `missingFields(schema, { ...request.body, userId: request?.userId || "" })` (ou o objeto que o contrato espere).
- **Params:** `missingFields(schema, request.params)`.

## Try/catch

Manter `errorHandler(error)` no final do `handle` para erros não tratados.

## Exemplo completo (body)

```ts
import { missingFields } from "@application/errors/missing-fields";
import { createSessionSchema } from "./schema";

async handle(request: IRequest): Promise<IResponse> {
  try {
    const [status, parsedBody] = missingFields(createSessionSchema, {
      ...request.body,
      userId: request?.userId || "",
    });
    if (!status) return parsedBody;
    const result = await this.createSessionService.execute(parsedBody);
    return { statusCode: 200, body: result.session };
  } catch (error) {
    return errorHandler(error);
  }
}
```

## Exemplo completo (params)

```ts
import { missingFields } from "@application/errors/missing-fields";
import { getSessionParamsSchema } from "./schema";

async handle(request: IRequest): Promise<IResponse> {
  try {
    const [status, parsedBody] = missingFields(getSessionParamsSchema, request.params);
    if (!status) return parsedBody;
    const result = await this.getSessionService.execute(parsedBody);
    return { statusCode: 200, body: result.session };
  } catch (error) {
    return errorHandler(error);
  }
}
```
