# ✅ Rate Limiting - Implementação Completa

## 📋 Resumo

O Rate Limiting foi implementado com sucesso no projeto usando `@nestjs/throttler`. A implementação protege a API contra ataques de força bruta, DDoS e abuso de requisições.

---

## 🎯 O que foi implementado

### 1. Instalação
- ✅ Pacote `@nestjs/throttler` instalado

### 2. Módulo de Throttler
- ✅ Criado `src/infra/throttler/throttler.module.ts`
- ✅ Configuração global: **100 requisições por minuto**

### 3. Decorators Personalizados
Criados decorators específicos para diferentes tipos de endpoints:

- **`@ThrottleLogin()`**: 5 tentativas por 15 minutos
- **`@ThrottleUpload()`**: 10 uploads por hora
- **`@ThrottleTokenGeneration()`**: 3 tentativas por hora
- **`@ThrottlePasswordReset()`**: 3 tentativas por hora

### 4. Aplicação nos Endpoints

#### Autenticação (User)
- ✅ `/api/auth/sign-in` - `@ThrottleLogin()`
- ✅ `/api/auth/forgot-password` - `@ThrottleTokenGeneration()`
- ✅ `/api/auth/verify-token` - `@ThrottleTokenGeneration()`
- ✅ `/api/auth/reset-password` - `@ThrottlePasswordReset()`

#### Autenticação (Customer)
- ✅ `/api/customer-auth/sign-in` - `@ThrottleLogin()`
- ✅ `/api/customer-auth/forgot-password` - `@ThrottleTokenGeneration()`
- ✅ `/api/customer-auth/verify-token` - `@ThrottleTokenGeneration()`
- ✅ `/api/customer-auth/reset-password` - `@ThrottlePasswordReset()`

#### Uploads
- ✅ `/api/products` (POST) - `@ThrottleUpload()`
- ✅ `/api/products/:id` (PATCH) - `@ThrottleUpload()`
- ✅ `/api/banners` (POST) - `@ThrottleUpload()`
- ✅ `/api/banners/:id` (PATCH) - `@ThrottleUpload()`
- ✅ `/api/social-media` (POST) - `@ThrottleUpload()`
- ✅ `/api/users/:id` (PATCH com foto) - `@ThrottleUpload()`

---

## 📊 Limites Configurados

| Tipo de Endpoint | Limite | Janela de Tempo |
|------------------|--------|-----------------|
| **API Geral** | 100 req | 1 minuto |
| **Login** | 5 req | 15 minutos |
| **Upload** | 10 req | 1 hora |
| **Geração de Token** | 3 req | 1 hora |
| **Reset de Senha** | 3 req | 1 hora |

---

## 🔧 Arquivos Criados/Modificados

### Novos Arquivos
- `src/infra/throttler/throttler.module.ts`
- `src/infra/throttler/index.ts`
- `src/interfaces/http/decorators/throttle.decorator.ts`

### Arquivos Modificados
- `src/app.module.ts` - Adicionado ThrottlerConfigModule e ThrottlerGuard
- `src/infra/index.ts` - Export do módulo throttler
- `src/interfaces/http/decorators/index.ts` - Export dos decorators
- `src/interfaces/http/controllers/auth/auth.controller.ts` - Aplicados decorators
- `src/interfaces/http/controllers/auth/customer-auth.controller.ts` - Aplicados decorators
- `src/interfaces/http/controllers/product/product.controller.ts` - Aplicados decorators
- `src/interfaces/http/controllers/banner/banner.controller.ts` - Aplicados decorators
- `src/interfaces/http/controllers/social-media/social-media.controller.ts` - Aplicados decorators
- `src/interfaces/http/controllers/user/user.controller.ts` - Aplicados decorators

---

## 🧪 Como Testar

### 1. Testar Rate Limiting Global
```bash
# Fazer 101 requisições em menos de 1 minuto
for i in {1..101}; do
  curl http://localhost:3333/api/products/list-view
done

# A 101ª requisição deve retornar 429 Too Many Requests
```

### 2. Testar Rate Limiting de Login
```bash
# Tentar fazer login 6 vezes em 15 minutos
for i in {1..6}; do
  curl -X POST http://localhost:3333/api/auth/sign-in \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# A 6ª tentativa deve retornar 429 Too Many Requests
```

### 3. Testar Rate Limiting de Upload
```bash
# Tentar fazer 11 uploads em 1 hora
# A 11ª tentativa deve retornar 429 Too Many Requests
```

---

## 📝 Resposta de Erro

Quando o limite é excedido, a API retorna:

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

Headers de resposta incluem:
- `X-RateLimit-Limit`: Limite máximo
- `X-RateLimit-Remaining`: Requisições restantes
- `X-RateLimit-Reset`: Timestamp de reset
- `Retry-After`: Segundos até poder tentar novamente

---

## ⚙️ Configuração Avançada

### Personalizar Limites

Para alterar os limites, edite `src/infra/throttler/throttler.module.ts`:

```typescript
ThrottlerModule.forRoot([
  {
    ttl: 60000, // Tempo em milissegundos
    limit: 100, // Número de requisições
  },
])
```

### Usar Storage Personalizado (Redis)

Para usar Redis em vez de memória (recomendado para produção):

```typescript
// Instalar: npm install @nestjs/throttler-storage-redis
import { ThrottlerStorageRedisService } from '@nestjs/throttler-storage-redis';

ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    storage: new ThrottlerStorageRedisService({
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
    }),
    ttl: 60000,
    limit: 100,
  }),
})
```

---

## 🚀 Próximos Passos

1. **Monitoramento**: Adicionar métricas de rate limiting
2. **Redis Storage**: Migrar para Redis para ambientes com múltiplas instâncias
3. **Whitelist**: Adicionar IPs/usuários que podem ter limites maiores
4. **Logs**: Registrar quando limites são excedidos

---

## ✅ Checklist de Implementação

- [x] Instalar pacote @nestjs/throttler
- [x] Criar módulo de throttler
- [x] Configurar rate limiting global
- [x] Criar decorators personalizados
- [x] Aplicar em endpoints de autenticação
- [x] Aplicar em endpoints de upload
- [x] Aplicar em endpoints de geração de token
- [x] Testar funcionamento
- [ ] Documentar na API (Swagger)
- [ ] Configurar Redis para produção (opcional)

---

**Data de Implementação**: 2025-01-23  
**Status**: ✅ Completo e Funcional

