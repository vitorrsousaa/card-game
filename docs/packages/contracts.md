# @repo/contracts

Shared contracts that define the **API contract** between backend (API/Game) and frontend (SPA). Single source of truth for request/response shapes, DTOs, and Zod schemas used for validation.

## Contents

- [Installation](#installation)
- [What’s in the package](#whats-in-the-package)
- [Exports and entry points](#exports-and-entry-points)
- [Naming conventions](#naming-conventions)
- [Usage in the API](#usage-in-the-api)
- [Usage in the SPA](#usage-in-the-spa)
- [API reference](#api-reference)
- [Build](#build)
- [Notes](#notes)

## Installation

Inside the monorepo, add the package as a dependency:

```sh
pnpm add @repo/contracts
```

In `package.json`:

```json
{
  "dependencies": {
    "@repo/contracts": "workspace:*"
  }
}
```

## What’s in the package

- **Zod schemas** for inputs/outputs (e.g. `CreateSessionInputSchema`, `CreateSessionOutputSchema`).
- **Inferred types** from schemas (e.g. `CreateSessionInput`, `CreateSessionOutput`).
- **DTOs** for entities as they travel over the wire (e.g. `TodoDto` with dates as ISO strings).
- **Common types** (e.g. `PaginatedResponse<T>`).

## Exports and entry points

The package uses **subpath exports** so you can import only what you need:

| Import path                   | Exposed types                                              |
| ----------------------------- | ---------------------------------------------------------- |
| `@repo/contracts/todo/inbox`  | `GetInboxTodosRequest`, `GetInboxTodosResponse`, `TodoDto` |
| `@repo/contracts/todo/create` | `CreateTodoRequest`, `CreateTodoResponse`                  |
| `@repo/contracts/common`      | `PaginatedResponse<T>`                                     |

### Examples

```typescript
// Inbox: request, response and DTO
import type {
  GetInboxTodosRequest,
  GetInboxTodosResponse,
  TodoDto,
} from "@repo/contracts/todo/inbox";

// Create todo
import type {
  CreateTodoRequest,
  CreateTodoResponse,
} from "@repo/contracts/todo/create";

// Common
import type { PaginatedResponse } from "@repo/contracts/common";
```

## Naming conventions

| Concept            | Pattern                         | Example                      |
| ------------------ | --------------------------------| ---------------------------- |
| Input schema       | `{Action}{Resource}InputSchema` | `CreateSessionInputSchema`   |
| Input type         | `{Action}{Resource}Input`       | `CreateSessionInput`         |
| Output schema      | `{Action}{Resource}OutputSchema`| `CreateSessionOutputSchema`  |
| Output type        | `{Action}{Resource}Output`      | `CreateSessionOutput`        |
| Wire object (DTO)  | `{Entity}Dto`                   | `TodoDto`, `SessionDto`      |
| Paginated list     | `PaginatedResponse<T>`          | `PaginatedResponse<TodoDto>` |

DTOs use the **serialized** format (e.g. dates as ISO strings). Use schemas for validation; infer types from schemas to avoid drift.

## Usage in the API

Use contract types only at the **edge** (controllers/handlers), not in services or domain.

1. **Controller** receives domain output from the service, maps it to the contract shape, and types the response body.

2. **Mapper** converts domain entities to DTOs (e.g. `Date` → ISO string). Keep this in the app layer (e.g. `app/modules/todos/mappers/todo-to-dto.ts`).

### Example: GET inbox

```typescript
// Controller
import type { GetInboxTodosResponse } from "@repo/contracts/todo/inbox";
import { todoToDto } from "@application/modules/todos/mappers/todo-to-dto";

const result = await this.getInboxTodosService.execute(parsedBody);
const body: GetInboxTodosResponse = {
  todos: result.todos.map(todoToDto),
  total: result.total,
};
return { statusCode: 200, body };
```

### Example: POST create

```typescript
// Controller
import type { CreateTodoResponse } from "@repo/contracts/todo/create";
import { todoToDto } from "@application/modules/todos/mappers/todo-to-dto";

const service = await this.createTodoService.execute(parsedBody);
const body: CreateTodoResponse = {
  todo: todoToDto(service.todo),
};
return { statusCode: 201, body };
```

## Usage in the SPA

Use contract types in **services** (API calls) and **view** (components that render the data).

1. **Service**: type the HTTP client with the response type from contracts.
2. **Hook**: use the same type for the returned data (e.g. `GetInboxTodosResponse`).
3. **Components**: receive `TodoDto` (or the relevant DTO) so the UI stays aligned with the API.

### Example: service

```typescript
import type { GetInboxTodosResponse } from "@repo/contracts/todo/inbox";
import { httpClient } from "@/services/http-client";

export async function getInboxTodos() {
  const { data } = await httpClient.get<GetInboxTodosResponse>("/todos/inbox");
  return data;
}
```

### Example: hook

```typescript
import type { GetInboxTodosResponse } from "@repo/contracts/todo/inbox";

const EMPTY_INBOX: GetInboxTodosResponse = { todos: [], total: 0 };

// ...
return {
  inboxTodos: data ?? EMPTY_INBOX,
  // ...
};
```

### Example: component

```typescript
import type { TodoDto } from "@repo/contracts/todo/inbox";

type InboxTodoCardProps = {
  todo: TodoDto;
};
```

## API reference

### `@repo/contracts/todo/inbox`

- **GetInboxTodosRequest** – `{ userId: string }`
- **GetInboxTodosResponse** – `{ todos: TodoDto[]; total: number }`
- **TodoDto** – todo entity as sent/received by the API (dates as ISO strings)

### `@repo/contracts/todo/create`

- **CreateTodoRequest** – `{ userId: string; projectId?: string | null; title: string; description: string }`
- **CreateTodoResponse** – `{ todo: TodoDto }` (use `TodoDto` from `@repo/contracts/todo/inbox` if needed)

### TodoDto (shared)

```typescript
interface TodoDto {
  id: string;
  userId: string;
  projectId: string | null;
  sectionId: string | null;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  order?: number;
  completedAt: string | null;
  dueDate: string | null;
  priority: "low" | "medium" | "high" | null;
}
```

### `@repo/contracts/common`

- **PaginatedResponse&lt;T&gt;** – `{ items: T[]; total: number; page?: number; pageSize?: number }`

## Build

From the repo root:

```sh
pnpm --filter @repo/contracts build
```

Or from the package:

```sh
cd packages/contracts && pnpm build
```

Build output is in `dist/` (ESM + `.d.ts`). Consumers resolve types via the package exports.

## Notes

- **Zod schemas live here** when shared validation is needed; infer types from schemas to prevent drift.
- **Interfaces only**: use when the shape is compile-time only and never validated at runtime.
- **Routes (URL paths)** are not defined here; they live in the SPA (or API) to avoid coupling.
- **Adding a new endpoint**: add or extend a folder under `src/todo/` (or another resource), export schemas/types/DTOs, then add the corresponding entry in `tsup.config.ts` and in `package.json` `exports` if you introduce a new subpath.
- For design rationale and when to consider OpenAPI/codegen, see [docs/contracts-package.md](../contracts-package.md).

[⬅ Back](../README.md)
