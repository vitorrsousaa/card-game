# Match Module

Módulo responsável por gerenciar partidas (matches/sessions) do jogo.

## Estrutura

```
match/
├── app/
│   ├── hooks/
│   │   ├── use-create-session.ts      # Hook React Query para criar session
│   │   ├── use-step-session.ts        # Hook React Query para step (jogar carta, atacar, etc.)
│   │   └── use-get-session.ts         # Hook React Query para buscar session por ID
│   └── services/
│       ├── create-session.ts          # Service HTTP POST /sessions
│       └── get-session.ts             # Service HTTP GET /sessions/:sessionId
└── view/
    └── components/
        ├── match-screen.tsx           # Componente da tela de partida (usa match.tsx)
        └── match-result.tsx           # Componente de resultado (vitória/derrota)
```

## Services

Os services HTTP ficam em `app/services/` (seguindo padrão do projeto):
- `create-session.ts`: cria sessão via `POST /sessions`
- `get-session.ts`: busca sessão por ID via `GET /sessions/:sessionId`
- `http-game-client` já existe e é usado pelos hooks

## Uso

### Criar sessão

```tsx
import { useCreateSession } from "@/modules/match/app/hooks/use-create-session";

function MatchPage() {
  const { createSessionAsync, session, isPendingCreateSession } = useCreateSession();

  const handleStart = async () => {
    await createSessionAsync();
    // session contém o SessionDto retornado (id, state, userId, createdAt, updatedAt)
  };

  // ...
}
```

### Buscar sessão por ID

```tsx
import { useGetSession } from "@/modules/match/app/hooks/use-get-session";

function MatchPage({ sessionId }: { sessionId: string | undefined }) {
  const { session, isLoadingSession, isErrorGetSession, refetch } = useGetSession(sessionId);

  if (isLoadingSession) return <div>Carregando...</div>;
  if (isErrorGetSession || !session) return <div>Sessão não encontrada</div>;

  // session é o SessionDto (mesmo formato do create)
  return <div>{session.id} - {session.state.phase}</div>;
}
```
