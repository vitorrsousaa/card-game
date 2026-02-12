# Match Module

Módulo responsável por gerenciar partidas (matches/sessions) do jogo.

## Estrutura

```
match/
├── app/
│   └── hooks/
│       ├── use-create-session.ts      # Hook React Query para criar session
│       ├── use-step-session.ts        # Hook React Query para step (jogar carta, atacar, etc.)
│       └── use-get-session.ts         # Hook React Query para buscar session por ID
└── view/
    └── components/
        ├── match-screen.tsx           # Componente da tela de partida (usa match.tsx)
        └── match-result.tsx           # Componente de resultado (vitória/derrota)
```

## Services

Os services HTTP ficam em `app/services/` (seguindo padrão do projeto):
- `http-game-client.ts` já existe e será usado pelos hooks

## Uso

```tsx
import { useCreateSession } from "@/modules/match/app/hooks/use-create-session";

function MatchPage() {
  const { mutate: createSession, data } = useCreateSession();
  
  useEffect(() => {
    createSession({ userId: "..." });
  }, []);
  
  // ...
}
```
