## Using @repo/contracts in Frontend

### Principles
- Type API services with contract output types/DTOs.
- Reuse input types for mutation payloads.
- Optionally reuse Zod schemas for client-side validation (forms) when useful.

### Service pattern
```typescript
import type {
  CreateSessionInput,
  CreateSessionResponseDto,
} from "@repo/contracts/game/sessions";
import { httpGameClient } from "@/services/http-game-client";

export async function createSession(
  input: CreateSessionInput,
): Promise<CreateSessionResponseDto> {
  const { data } = await httpGameClient.post("/sessions", input);
  return data;
}
```

### Hook pattern
- Hooks should return data typed with the contract output to keep UI aligned.

```typescript
import { useMutation } from "@tanstack/react-query";
import { createSession } from "../services/create-session";

export function useCreateSession() {
  return useMutation({ mutationFn: createSession });
}
```

### Components
- Components receive DTOs so rendering stays consistent with the API contract.

### Optional client-side validation
- Use the same Zod schemas from contracts to validate form inputs before sending requests, if needed for better UX.

### Checklist when adding a new call
- [ ] Import input/output types (and schemas if needed) from contracts.
- [ ] Services return data typed with contract outputs.
- [ ] Hooks/components consume the same DTOs.
