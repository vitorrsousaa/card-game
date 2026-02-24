# Arquitetura de Cache

## Visão Geral

A implementação de cache segue o padrão de **Clean Architecture**, criando uma camada de abstração que permite trocar a tecnologia de cache (Redis, Memcached, in-memory, etc.) sem que a aplicação saiba qual está sendo usada.

## Por Que Usar uma Camada de Abstração?

1. **Substituição fácil:** Trocar Redis por Memcached, DynamoDB, ou in-memory requer apenas criar nova implementação de `ICacheProvider`
2. **Testabilidade:** Usar `InMemoryCacheProvider` em testes sem precisar de Redis
3. **Flexibilidade:** Adicionar múltiplos providers (ex: Redis + DynamoDB fallback)
4. **Desacoplamento:** Application layer não conhece Redis, apenas `ISessionsRepository`
5. **Evolução:** Migrar para DynamoDB ou API Lambda mantendo mesma interface

## Diagrama da Arquitetura

```
┌─────────────────────────────────────────┐
│   Application Layer (Services)         │
│   - CreateSessionService                │
│   - StepSessionService (futuro)        │
└──────────────┬──────────────────────────┘
               │ depende de
               ↓
┌─────────────────────────────────────────┐
│   Data Layer (Protocols/Interfaces)     │
│   - ISessionsRepository                 │
│   - ICacheProvider (genérico)          │
└──────────────┬──────────────────────────┘
               │ implementado por
               ↓
┌─────────────────────────────────────────┐
│   Infrastructure Layer                  │
│   - RedisSessionsRepository             │
│   - RedisCacheProvider                  │
│   - InMemorySessionsRepository (dev)   │
└─────────────────────────────────────────┘
```

## Estrutura de Arquivos

### Interfaces (Application Layer)

- `src/app/interfaces/cache-provider.ts` - Interface genérica para qualquer provedor de cache
- `src/app/interfaces/sessions-repository.ts` - Interface específica para sessions

### Implementações (Infrastructure Layer)

- `src/infra/cache/redis-cache-provider.ts` - Implementação Redis usando ioredis
- `src/infra/cache/in-memory-cache-provider.ts` - Implementação em memória para dev/testes
- `src/infra/repositories/sessions/redis-sessions-repository.ts` - Repositório de sessions usando cache

### Factories

- `src/factories/providers/cache-provider.ts` - Factory que decide qual cache provider usar
- `src/factories/repositories/sessions-repository.ts` - Factory que cria o sessions repository

## Como o Cache é Utilizado

### Sessions

- **Key Pattern:** `session:{sessionId}`
- **TTL:** 24 horas (86400 segundos)
- **Estrutura:** `SessionDto` com `id`, `state`, `userId`, `createdAt`, `updatedAt`

### Exemplo de Uso

```typescript
// No CreateSessionService
const sessionDto: SessionDto = {
  id: sessionId,
  state: result.state,
  userId: input.userId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

await this.sessionsRepository.save(sessionDto);
```

## Estratégia de Cache

### Write-Through Cache

1. **Criar session** → Salvar no cache imediatamente
2. **Update session** → Atualizar no cache
3. **Read session** → Ler do cache
4. **TTL de 24h** para sessions inativas
5. **Futuro:** Sincronizar com DynamoDB para persistência durável

## Configuração e Variáveis de Ambiente

### Variável de Ambiente

- `REDIS_URL` - URL de conexão do Redis (ex: `redis://localhost:6379`)

### Comportamento

- **Se `REDIS_URL` estiver definida:** Usa `RedisCacheProvider`
- **Se `REDIS_URL` não estiver definida:** Usa `InMemoryCacheProvider` (fallback)

### Exemplos

```bash
# Desenvolvimento local
REDIS_URL=redis://localhost:6379

# Docker (dentro do container)
REDIS_URL=redis://redis:6379

# Produção (sem Redis configurado, usa in-memory)
# Não definir REDIS_URL
```

## Padrões de Key

- **Sessions:** `session:{sessionId}` - TTL 24h
- **User sessions (futuro):** `user:{userId}:sessions` - Lista de session IDs ativos
- **Rate limiting (futuro):** `ratelimit:{userId}:{endpoint}` - TTL 1min

## Como Trocar de Redis para Outra Tecnologia

### Exemplo: Trocar para Memcached

1. Instalar cliente Memcached: `npm install memcached`
2. Criar `src/infra/cache/memcached-cache-provider.ts`:

```typescript
import type { ICacheProvider } from "@application/interfaces/cache-provider";
import Memcached from "memcached";

export class MemcachedCacheProvider implements ICacheProvider {
  private client: Memcached;

  constructor(connectionString: string) {
    this.client = new Memcached(connectionString);
  }

  async get<T>(key: string): Promise<T | null> {
    // Implementação...
  }

  // ... outros métodos
}
```

3. Atualizar `makeCacheProvider()`:

```typescript
export function makeCacheProvider(): ICacheProvider {
  const memcachedUrl = process.env.MEMCACHED_URL;
  if (memcachedUrl) {
    return new MemcachedCacheProvider(memcachedUrl);
  }
  return new InMemoryCacheProvider();
}
```

**Nenhuma outra mudança é necessária!** O `CreateSessionService` continua funcionando sem alterações.

## Troubleshooting e Monitoramento

### Verificar se Redis está funcionando

```bash
# Conectar ao Redis
docker compose exec redis redis-cli

# Listar todas as sessions
KEYS session:*

# Ver uma session específica
GET session:{sessionId}

# Verificar TTL
TTL session:{sessionId}

# Limpar todas as sessions
KEYS session:* | xargs DEL
```

### Logs

O cache provider e repository logam operações importantes:

- `RedisCacheProvider` - Logs de erros e operações
- `RedisSessionsRepository` - Logs de debug para operações de session

### Problemas Comuns

1. **Redis não conecta:**
   - Verificar `REDIS_URL` está correta
   - Verificar Redis está rodando: `docker compose ps redis`
   - Verificar logs: `docker compose logs redis`

2. **Sessions não persistem:**
   - Verificar TTL não expirou
   - Verificar logs de erro no cache provider
   - Verificar se `sessionsRepository.save()` está sendo chamado

3. **Fallback para in-memory:**
   - Se `REDIS_URL` não estiver definida, usa in-memory automaticamente
   - Sessions serão perdidas ao reiniciar a aplicação
   - Para produção, sempre definir `REDIS_URL`

## Testes

### Teste Manual

```bash
# 1. Subir Redis
docker compose up -d redis

# 2. Criar session
curl -X POST http://localhost:3001/sessions \
  -H "Content-Type: application/json" \
  -d '{"userId": "123e4567-e89b-12d3-a456-426614174000"}'

# 3. Verificar no Redis
docker compose exec redis redis-cli KEYS "session:*"
docker compose exec redis redis-cli GET "session:{sessionId}"
```

### Teste Unitário (com InMemoryCacheProvider)

```typescript
import { InMemoryCacheProvider } from "@infra/cache/in-memory-cache-provider";
import { RedisSessionsRepository } from "@infra/repositories/sessions/redis-sessions-repository";

const cacheProvider = new InMemoryCacheProvider();
const repository = new RedisSessionsRepository(cacheProvider);

// Testar sem precisar de Redis rodando
await repository.save(session);
const found = await repository.findById(session.id);
```

## Próximos Passos

1. ✅ Implementar `GET /sessions/:id` para recuperar sessions
2. ✅ Implementar `POST /sessions/:id/step` para avançar partida
3. ⏳ Adicionar sincronização com DynamoDB (opcional)
4. ⏳ Implementar WebSocket com cache de conexões
5. ⏳ Adicionar cache para rate limiting
6. ⏳ Implementar cache para user sessions list
