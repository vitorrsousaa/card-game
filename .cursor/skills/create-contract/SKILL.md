---
name: create-contract
description: "Guide for adding new contracts (schemas + DTOs) to @repo/contracts."
---

# Create Contract Skill

Use this when adding a new contract to `@repo/contracts`.

## Questions to ask (one at a time)
1) Endpoint basics: resource, action, HTTP method, path?
2) Who consumes it? (API, Game API, SPA)
3) Do we need runtime validation? (If yes, add Zod schemas)
4) Input shape and required/optional fields?
5) Output shape and DTOs (transport format, dates as ISO strings)?
6) Any enums or shared types to reuse?

## Naming rules
- Input schema: `{Action}{Resource}InputSchema`
- Input type: `{Action}{Resource}Input`
- Output schema: `{Action}{Resource}OutputSchema`
- Output type: `{Action}{Resource}Output`
- DTO: `{Entity}Dto`

## Steps
1. Create or update `packages/contracts/src/<area>/<resource>/dto.ts` with:
   - Zod schemas for inputs/outputs.
   - Inferred types from schemas.
   - DTOs in transport format.
2. Export via `index.ts` in the resource folder and parent folder.
3. If adding a new subpath, add it to `tsup.config.ts` entries if needed.
4. Keep services/domain code outside of contracts; only schemas/types/DTOs belong here.

## Templates
```typescript
import { z } from "zod";

export const {Action}{Resource}InputSchema = z.object({
  // fields
});
export type {Action}{Resource}Input = z.infer<
  typeof {Action}{Resource}InputSchema
>;

export const {Action}{Resource}OutputSchema = z.object({
  // fields
});
export type {Action}{Resource}Output = z.infer<
  typeof {Action}{Resource}OutputSchema
>;

export interface {Entity}Dto {
  id: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

## Validation checklist
- [ ] Names follow the patterns above.
- [ ] Zod schemas exist for inputs/outputs when runtime validation is needed.
- [ ] Types are inferred from schemas (no duplicate object literals).
- [ ] DTOs use transport format (ISO strings for dates, etc.).
- [ ] Exports wired through `index.ts` files (resource + parent).
- [ ] `tsup.config.ts` updated if a new entry point was added.
