## Using @repo/contracts in Backend

### Principles
- Validate inputs with Zod schemas from contracts.
- Keep domain entities separate; map to DTOs at the controller boundary.
- Use inferred types from schemas to avoid drift.

### Controller pattern
```typescript
import {
  CreateSessionInputSchema,
  CreateSessionInput,
  CreateSessionOutput,
  CreateSessionResponseDto,
} from "@repo/contracts/game/sessions";

const [ok, parsed] = missingFields(CreateSessionInputSchema, request.body);
if (!ok) return badRequest(parsed);

const result: CreateSessionOutput = await service.execute(parsed);
const response: CreateSessionResponseDto = { sessions: result.sessions };
return { statusCode: 200, body: response };
```

### Service pattern
- Services accept contract input types but should operate on domain entities internally.
- Convert domain entities to DTOs at the boundary (controller/mapper).

### When to create mappers
- Domain uses `Date` and rich objects; DTOs use transport-friendly shapes (ISO strings).
- Add mappers in `app/modules/<feature>/mappers` to convert domain → DTO.

### Adding a new endpoint
1) Add schemas/types/DTOs under `packages/contracts/src/<area>/<resource>/dto.ts`.
2) Export via the folder `index.ts` and parent `index.ts`.
3) Import schemas in controllers for validation; import types/DTOs for responses.

### Notes
- Use `logger.error`/`logger.warn` when validation or mapping fails.
- Keep schemas in contracts, not in controllers, to avoid duplication across apps.
