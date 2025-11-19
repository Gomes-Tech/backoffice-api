# 🔌 Circuit Breaker - Implementação

**Data**: 2025-01-23  
**Status**: ✅ Implementado

---

## 📋 Resumo

O Circuit Breaker foi implementado para proteger a aplicação contra falhas em cascata quando serviços externos (banco de dados, cache, APIs externas) falham. Ele monitora o estado das operações e automaticamente "abre" o circuit quando detecta muitas falhas consecutivas, evitando sobrecarregar serviços que já estão com problemas.

---

## 🎯 Funcionalidades

### Estados do Circuit Breaker

1. **CLOSED** (Fechado)
   - Estado normal, operações são executadas normalmente
   - Falhas são contadas
   - Após `failureThreshold` falhas, transiciona para OPEN

2. **OPEN** (Aberto)
   - Circuit está aberto, operações são bloqueadas imediatamente
   - Retorna erro `503 Service Unavailable` com header `Retry-After`
   - Após `resetTimeout`, transiciona para HALF_OPEN

3. **HALF_OPEN** (Meio Aberto)
   - Estado de teste, permite algumas operações
   - Se `successThreshold` sucessos ocorrerem, fecha o circuit (CLOSED)
   - Se uma falha ocorrer, abre novamente (OPEN)

### Configurações Padrão

- **failureThreshold**: 5 falhas consecutivas
- **timeout**: 10000ms (10 segundos)
- **resetTimeout**: 60000ms (60 segundos)
- **successThreshold**: 1 sucesso (para fechar de HALF_OPEN para CLOSED)

---

## 📦 Arquivos Criados

### Serviço Principal

- `src/infra/circuit-breaker/circuit-breaker.service.ts`
  - Implementação principal do circuit breaker
  - Gerencia estados e transições
  - Integra com métricas

- `src/infra/circuit-breaker/circuit-breaker.module.ts`
  - Módulo NestJS para o circuit breaker
  - Exporta `CircuitBreakerService` globalmente

- `src/infra/circuit-breaker/index.ts`
  - Exports do módulo

### Decorator e Interceptor

- `src/shared/decorators/circuit-breaker.decorator.ts`
  - Decorator `@CircuitBreaker()` para aplicar em métodos

- `src/shared/interceptors/circuit-breaker.interceptor.ts`
  - Interceptor que aplica o circuit breaker automaticamente

### Integrações

- **CacheService**: Integrado automaticamente
  - Circuit breakers: `cache:get`, `cache:set`, `cache:del`
  - Timeout: 5 segundos
  - Reset timeout: 30 segundos

- **Métricas**: Adicionadas ao `MetricsService`
  - `circuit_breaker_state_changes_total`
  - `circuit_breaker_successes_total`
  - `circuit_breaker_failures_total`
  - `circuit_breaker_opens_total`
  - `circuit_breaker_state` (gauge)

- **Filtro de Exceção**: Tratamento de erros
  - `CircuitBreakerOpenException` → 503 Service Unavailable
  - `TimeoutError` → 408 Request Timeout

---

## 🚀 Como Usar

### 1. Uso Direto no Serviço

```typescript
import { Injectable } from '@nestjs/common';
import { CircuitBreakerService } from '@infra/circuit-breaker';

@Injectable()
export class MyService {
  constructor(
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  async fetchData(): Promise<any> {
    return this.circuitBreakerService.execute(
      'external-api',
      async () => {
        // Sua operação aqui
        return await this.httpService.get('https://api.example.com/data');
      },
      {
        failureThreshold: 5,
        timeout: 10000,
        resetTimeout: 60000,
      },
    );
  }
}
```

### 2. Usando o Decorator

```typescript
import { Injectable } from '@nestjs/common';
import { CircuitBreaker } from '@shared/decorators';
import { CircuitBreakerInterceptor } from '@shared/interceptors';

@Injectable()
@UseInterceptors(CircuitBreakerInterceptor)
export class MyService {
  @CircuitBreaker('database-query', {
    failureThreshold: 5,
    timeout: 10000,
    resetTimeout: 60000,
  })
  async findUser(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

### 3. Aplicar Globalmente (Opcional)

No `app.module.ts`:

```typescript
import { CircuitBreakerInterceptor } from '@shared/interceptors';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CircuitBreakerInterceptor,
    },
  ],
})
export class AppModule {}
```

---

## 📊 Métricas

As seguintes métricas estão disponíveis no endpoint `/api/metrics`:

```prometheus
# Mudanças de estado
circuit_breaker_state_changes_total{key="cache:get",state="OPEN"} 1

# Sucessos
circuit_breaker_successes_total{key="cache:get"} 100

# Falhas
circuit_breaker_failures_total{key="cache:get",type="error"} 5

# Circuit aberto
circuit_breaker_opens_total{key="cache:get"} 1

# Estado atual (0=CLOSED, 1=HALF_OPEN, 2=OPEN)
circuit_breaker_state{key="cache:get"} 0
```

---

## 🔧 API do CircuitBreakerService

### Métodos Principais

```typescript
// Executar operação com circuit breaker
execute<T>(key: string, operation: () => Promise<T>, options?: CircuitBreakerOptions): Promise<T>

// Obter estado atual
getCircuitState(key: string): CircuitState

// Resetar um circuit breaker
reset(key: string): void

// Resetar todos
resetAll(): void

// Obter estatísticas
getStats(key: string): CircuitStats | null

// Listar circuit breakers ativos
listActiveCircuits(): string[]
```

### Exemplo de Uso Avançado

```typescript
// Verificar estado antes de executar
const state = circuitBreakerService.getCircuitState('my-service');
if (state === 'OPEN') {
  // Retornar cache ou valor padrão
  return cachedData;
}

// Obter estatísticas
const stats = circuitBreakerService.getStats('my-service');
console.log(`Falhas: ${stats.failures}, Estado: ${stats.state}`);

// Resetar manualmente (útil para testes)
circuitBreakerService.reset('my-service');
```

---

## 🛡️ Tratamento de Erros

### CircuitBreakerOpenException

Quando o circuit está aberto:

```typescript
try {
  await circuitBreakerService.execute('service', operation);
} catch (error) {
  if (error instanceof CircuitBreakerOpenException) {
    // Circuit está aberto
    // Retry after: error.retryAfter (em ms)
    // Key: error.key
  }
}
```

**Resposta HTTP**:
- Status: `503 Service Unavailable`
- Header: `Retry-After: <segundos>`
- Body:
```json
{
  "statusCode": 503,
  "timestamp": "2025-01-23T10:00:00.000Z",
  "path": "/api/users",
  "message": "Serviço temporariamente indisponível. Tente novamente mais tarde.",
  "retryAfter": 30
}
```

### TimeoutError

Quando a operação excede o timeout:

```typescript
try {
  await circuitBreakerService.execute('service', operation);
} catch (error) {
  if (error instanceof TimeoutError) {
    // Timeout ocorreu
    // Key: error.key
  }
}
```

**Resposta HTTP**:
- Status: `408 Request Timeout`
- Body:
```json
{
  "statusCode": 408,
  "timestamp": "2025-01-23T10:00:00.000Z",
  "path": "/api/users",
  "message": "A operação excedeu o tempo limite. Tente novamente."
}
```

---

## ✅ Integrações Automáticas

### CacheService

O `CacheService` já está integrado com circuit breaker:

- **get()**: Circuit `cache:get`
- **set()**: Circuit `cache:set`
- **del()**: Circuit `cache:del`

Configuração:
- Timeout: 5 segundos
- Failure threshold: 5
- Reset timeout: 30 segundos

---

## 📝 Exemplos de Uso

### Exemplo 1: Proteger Chamada de API Externa

```typescript
@Injectable()
export class ExternalApiService {
  constructor(
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly httpService: HttpService,
  ) {}

  async fetchUserData(userId: string) {
    return this.circuitBreakerService.execute(
      'external-api:users',
      async () => {
        const response = await this.httpService
          .get(`https://api.example.com/users/${userId}`)
          .toPromise();
        return response.data;
      },
      {
        failureThreshold: 3,
        timeout: 5000,
        resetTimeout: 30000,
      },
    );
  }
}
```

### Exemplo 2: Proteger Query do Banco

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly prisma: PrismaService,
  ) {}

  async findUser(id: string) {
    return this.circuitBreakerService.execute(
      'database:users:find',
      async () => {
        return this.prisma.user.findUnique({ where: { id } });
      },
      {
        failureThreshold: 5,
        timeout: 10000,
      },
    );
  }
}
```

### Exemplo 3: Com Fallback

```typescript
async getUserData(id: string) {
  try {
    return await this.circuitBreakerService.execute(
      'user-service',
      () => this.fetchFromService(id),
    );
  } catch (error) {
    if (error instanceof CircuitBreakerOpenException) {
      // Retornar dados do cache ou valor padrão
      return this.getCachedUser(id) || this.getDefaultUser();
    }
    throw error;
  }
}
```

---

## 🔍 Monitoramento

### Verificar Estado

```typescript
// No seu controller ou service
@Get('circuit-breaker/status')
async getCircuitBreakerStatus() {
  const circuits = circuitBreakerService.listActiveCircuits();
  const status = circuits.map(key => ({
    key,
    state: circuitBreakerService.getCircuitState(key),
    stats: circuitBreakerService.getStats(key),
  }));
  return status;
}
```

### Logs

O circuit breaker registra logs automáticos:

- `Circuit breaker {key} opening after {failures} failures`
- `Circuit breaker {key} transitioning from OPEN to HALF_OPEN`
- `Circuit breaker {key} transitioning from HALF_OPEN to CLOSED`

---

## ⚙️ Configuração

### Opções do Circuit Breaker

```typescript
interface CircuitBreakerOptions {
  failureThreshold?: number;  // Default: 5
  timeout?: number;           // Default: 10000ms
  resetTimeout?: number;      // Default: 60000ms
  successThreshold?: number;  // Default: 1
}
```

### Variáveis de Ambiente

Não há variáveis de ambiente específicas. O circuit breaker funciona automaticamente quando o módulo é importado.

---

## 🎓 Boas Práticas

1. **Use chaves descritivas**: `'database:users:find'` em vez de `'db1'`
2. **Configure timeouts apropriados**: Baseado no tempo esperado da operação
3. **Monitore métricas**: Acompanhe `circuit_breaker_opens_total` para identificar problemas
4. **Implemente fallbacks**: Quando possível, retorne dados do cache ou valores padrão
5. **Ajuste thresholds**: Baseado no comportamento real da aplicação

---

## 📚 Referências

- [Circuit Breaker Pattern - Martin Fowler](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Resilience Patterns](https://microservices.io/patterns/reliability/circuit-breaker.html)

---

**Última atualização**: 2025-01-23

