---
name: react-query-destructuring
description: Enforce destructuring pattern for useMutation and useQuery hooks. Use when reading, creating, or modifying React Query hooks (useMutation, useQuery) to ensure proper destructuring instead of using the raw mutation/query object.
---

# React Query Destructuring

## Regra Obrigatória

Ao trabalhar com `useMutation` ou `useQuery`, **sempre desestruture** o retorno. Nunca use `const mutation = useMutation(...)` ou `const query = useQuery(...)` e acesse propriedades via `mutation.mutate`, `query.data`, etc.

## Padrão para useMutation

```typescript
// ✅ Correto
const {
  mutate: createSession,
  mutateAsync: createSessionAsync,
  isPending,
  isError,
  data,
} = useMutation({
  mutationKey: QUERY_KEYS.SESSIONS.CREATE,
  mutationFn: createSession,
  onSuccess: (data) => { /* ... */ },
  onError: (error) => { /* ... */ },
});

return {
  createSession,
  createSessionAsync,
  isPendingCreateSession: isPending,
  isErrorCreateSession: isError,
  session: data,
};
```

```typescript
// ❌ Evitar
const mutation = useMutation({ /* ... */ });
return {
  createSession: mutation.mutate,
  isPendingCreateSession: mutation.isPending,
};
```

## Padrão para useQuery

```typescript
// ✅ Correto
const {
  data: session,
  isLoading: isLoadingSession,
  isError: isErrorGetSession,
  refetch,
} = useQuery({
  queryKey: QUERY_KEYS.SESSIONS.DETAIL(sessionId ?? ""),
  queryFn: () => getSession(sessionId as string),
  enabled: !!sessionId,
});

return { session, isLoadingSession, isErrorGetSession, refetch };
```

```typescript
// ❌ Evitar
const query = useQuery({ /* ... */ });
return { session: query.data, isLoading: query.isLoading };
```

## Casos Especiais

Quando usar `useMutationState` ou outros hooks junto com `useMutation`, desestruture primeiro e combine depois:

```typescript
const {
  mutate: createSession,
  mutateAsync: createSessionAsync,
  isPending,
  data,
} = useMutation({ /* ... */ });

const mutationStates = useMutationState({ /* ... */ });
const isErrorFromCache = /* derivado de mutationStates */;

return {
  createSession,
  createSessionAsync,
  isPendingCreateSession: isPending,
  isErrorCreateSession: isErrorFromCache, // usa cache quando necessário
  session: data,
};
```

## Checklist ao Revisar

- [ ] `useMutation` retorna objeto desestruturado?
- [ ] `useQuery` retorna objeto desestruturado?
- [ ] Nomes de retorno são de domínio (ex: `createSession`, não `mutate`)?
- [ ] Não há `mutation.` ou `query.` no return?
