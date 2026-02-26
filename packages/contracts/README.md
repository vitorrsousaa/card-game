## @repo/contracts

Shared contracts for the Artemis stack: Zod schemas plus TypeScript types for backend validation and frontend typing. This package is the single source of truth for request/response shapes and DTOs.

### What’s included
- Zod schemas for inputs/outputs (e.g., `CreateSessionInputSchema`).
- Inferred types from schemas (e.g., `CreateSessionInput`, `CreateSessionOutput`).
- DTOs for wire format (e.g., `SessionDto`).
- Common types (e.g., `PaginatedResponse`).

### Naming convention
| Kind | Pattern | Example |
| --- | --- | --- |
| Input schema | `{Action}{Resource}InputSchema` | `CreateSessionInputSchema` |
| Input type | `{Action}{Resource}Input` | `CreateSessionInput` |
| Output schema | `{Action}{Resource}OutputSchema` | `CreateSessionOutputSchema` |
| Output type | `{Action}{Resource}Output` | `CreateSessionOutput` |
| DTO | `{Entity}Dto` | `SessionDto`, `CardDto` |

Use schemas for validation; use DTOs for transport (dates as ISO strings, etc.).

### Folder structure
```
packages/contracts/
├─ src/
│  ├─ common/
│  ├─ game/
│  │  ├─ sessions/
│  │  ├─ cards/
│  │  └─ decks/
│  └─ index.ts
├─ package.json
└─ tsup.config.ts
```

### Usage in backend
- Validate inputs with the Zod schema from contracts.
- Type controller responses with output types/DTOs.
- Keep domain entities separate; map to DTOs at the boundary.

Example:
```typescript
import {
  CreateSessionInputSchema,
  CreateSessionInput,
  CreateSessionOutput,
} from "@repo/contracts/game/sessions";

const [ok, parsed] = missingFields(CreateSessionInputSchema, body);
if (!ok) return badRequest(parsed);

const result: CreateSessionOutput = await service.execute(parsed);
return { statusCode: 200, body: result.sessions };
```

### Usage in frontend
- Type API services with output types/DTOs from contracts.
- Optionally reuse schemas for client-side validation when needed.

Example:
```typescript
import type {
  CreateSessionInput,
  CreateSessionResponseDto,
} from "@repo/contracts/game/sessions";

export async function createSession(
  input: CreateSessionInput,
): Promise<CreateSessionResponseDto> {
  const { data } = await httpGameClient.post("/sessions", input);
  return data;
}
```

### Adding a new contract
1. Create `{resource}/dto.ts` with schemas, inferred types, and DTOs.
2. Export via `{resource}/index.ts`, `src/game/index.ts`, and `src/index.ts` as needed.
3. Follow the naming table above.
4. Include Zod schemas when validation is required across services.

### Build & scripts
- `pnpm --filter @repo/contracts build` — builds ESM + d.ts into `dist/`.
- `pnpm --filter @repo/contracts lint|typecheck` — validates code quality.

### When to use Zod vs plain interfaces
- Use **Zod schemas** when a consumer needs runtime validation (API inputs/outputs shared with frontend).
- Use **interfaces only** when the shape is purely compile-time and never validated at runtime.
