# 🔒 Melhorias de Segurança e Escalabilidade

Este documento apresenta uma análise detalhada do projeto e recomendações de melhorias em termos de **segurança** e **escalabilidade**.

---

## 📋 Índice

1. [Segurança](#segurança)
2. [Escalabilidade](#escalabilidade)
3. [Priorização](#priorização)

---

## 🔒 SEGURANÇA

### 🔴 CRÍTICO - Implementar Rate Limiting

**Problema**: Não há proteção contra ataques de força bruta, DDoS ou abuso de API.

**Impacto**:

- Ataques de força bruta em endpoints de autenticação
- Sobrecarga do servidor por requisições excessivas
- Possível negação de serviço (DoS)

**Solução**:

```typescript
// Instalar: npm install @nestjs/throttler
// src/infra/throttler/throttler.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 10, // 10 requisições por minuto
      },
    ]),
  ],
})
export class ThrottlerConfigModule {}
```

**Recomendações**:

- **Login/Auth**: 5 tentativas por 15 minutos por IP
- **API Geral**: 100 requisições por minuto por IP
- **Upload de arquivos**: 10 uploads por hora por usuário
- **Geração de tokens**: 3 tentativas por hora por email

---

### 🔴 CRÍTICO - Configuração do Helmet

**Problema**: Helmet está configurado sem opções específicas, pode estar bloqueando recursos legítimos.

**Impacto**:

- Headers de segurança não otimizados
- Possível bloqueio de recursos necessários

**Solução**:

```typescript
// src/main.ts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false, // Se usar recursos externos
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
```

---

### 🔴 CRÍTICO - Validação de Email e Senha

**Problema**: DTOs não validam formato de email nem força de senha.

**Impacto**:

- Senhas fracas aceitas
- Emails inválidos aceitos
- Vulnerabilidade a ataques

**Solução**:

```typescript
// src/interfaces/http/dtos/customer/create-customer.dto.ts
import { IsEmail, MinLength, Matches } from 'class-validator';

export class CreateCustomerDTO {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Senha deve conter letras maiúsculas, minúsculas e números',
  })
  password: string;
}
```

---

### 🟡 ALTO - Sanitização de Entrada

**Problema**: Dados de entrada não são sanitizados contra XSS e SQL Injection.

**Impacto**:

- Vulnerabilidade a XSS (Cross-Site Scripting)
- Possível SQL Injection (embora Prisma ajude, não é suficiente)

**Solução**:

```typescript
// Instalar: npm install dompurify sanitize-html
// src/shared/utils/sanitize.util.ts
import * as sanitizeHtml from 'sanitize-html';

export function sanitizeInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

// Usar em DTOs com Transform
@Transform(({ value }) => sanitizeInput(value))
name: string;
```

---

### 🟡 ALTO - Logs de Segurança

**Problema**: Não há logs específicos para eventos de segurança.

**Impacto**:

- Dificuldade em detectar ataques
- Falta de auditoria de segurança

**Solução**:

```typescript
// src/infra/logger/security-logger.service.ts
@Injectable()
export class SecurityLoggerService {
  logFailedLogin(email: string, ip: string) {
    this.logger.warn('Tentativa de login falhada', {
      email,
      ip,
      timestamp: new Date(),
      type: 'SECURITY',
    });
  }

  logSuspiciousActivity(userId: string, activity: string) {
    this.logger.error('Atividade suspeita detectada', {
      userId,
      activity,
      timestamp: new Date(),
      type: 'SECURITY_ALERT',
    });
  }
}
```

---

### 🟡 ALTO - Proteção CSRF

**Problema**: CSRF está instalado mas não está sendo usado globalmente.

**Impacto**:

- Vulnerabilidade a ataques CSRF

**Solução**:

```typescript
// src/main.ts
import * as csurf from 'csurf';

// Apenas para produção e rotas que não são API pura
if (process.env.NODE_ENV === 'prod') {
  app.use(csurf({ cookie: true }));
}
```

**Nota**: Para APIs REST puras, CSRF pode não ser necessário se usar tokens JWT em cookies httpOnly.

---

### 🟡 ALTO - Rotação de Tokens JWT

**Problema**: Não há mecanismo de revogação ou blacklist de tokens.

**Impacto**:

- Tokens comprometidos permanecem válidos até expirarem
- Impossibilidade de fazer logout efetivo

**Solução**:

```typescript
// Implementar blacklist de tokens
// src/infra/cache/token-blacklist.service.ts
@Injectable()
export class TokenBlacklistService {
  async blacklistToken(token: string, expiresIn: number) {
    const jti = this.extractJti(token); // JWT ID
    await this.cacheService.set(`blacklist:${jti}`, true, expiresIn);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const jti = this.extractJti(token);
    return !!(await this.cacheService.get(`blacklist:${jti}`));
  }
}
```

---

### 🟡 ALTO - Headers de Segurança Adicionais

**Problema**: Faltam headers importantes de segurança.

**Solução**:

```typescript
// src/main.ts
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()',
  );
  next();
});
```

---

### 🟢 MÉDIO - Validação de CORS Dinâmica

**Problema**: CORS com origens hardcoded.

**Impacto**:

- Dificuldade de manutenção
- Possível exposição a origens não autorizadas

**Solução**:

```typescript
// src/main.ts
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});
```

---

### 🟢 MÉDIO - Proteção de Dados Sensíveis

**Problema**: Dados sensíveis podem ser expostos em logs e respostas.

**Impacto**:

- Exposição de informações pessoais
- Violação de LGPD/GDPR

**Solução**:

```typescript
// src/infra/filters/http-exception.filter.ts
// Remover dados sensíveis antes de logar
private sanitizeError(error: any) {
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
  // ... lógica de sanitização
}
```

---

### 🟢 MÉDIO - Timeout de Requisições

**Problema**: Não há timeout configurado para requisições longas.

**Impacto**:

- Possível DoS por requisições que ficam pendentes

**Solução**:

```typescript
// src/main.ts
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 segundos
  res.setTimeout(30000);
  next();
});
```

---

### 🟢 MÉDIO - Validação de Tamanho de Payload

**Problema**: Não há limite explícito de tamanho de requisição.

**Impacto**:

- Possível DoS por payloads grandes

**Solução**:

```typescript
// src/main.ts
import { json } from 'express';

app.use(json({ limit: '10mb' })); // Limitar tamanho
```

---

## 📈 ESCALABILIDADE

### 🔴 CRÍTICO - Connection Pooling do Prisma

**Problema**: Prisma não está configurado com connection pooling adequado.

**Impacto**:

- Limite de conexões simultâneas
- Degradação de performance sob carga
- Possível esgotamento de conexões

**Solução**:

```typescript
// src/infra/prisma/prisma.service.ts
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log:
        process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**Configuração no DATABASE_URL**:

```
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=20&pool_timeout=20"
```

---

### 🔴 CRÍTICO - Cache Distribuído

**Problema**: Cache está usando memória local (cache-manager padrão).

**Impacto**:

- Cache não compartilhado entre instâncias
- Inconsistência em ambientes com múltiplos servidores
- Perda de cache ao reiniciar

**Solução**:

```typescript
// Instalar: npm install cache-manager-redis-store cache-manager
// src/infra/cache/cache.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Global()
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      ttl: 3600,
      max: 1000,
    }),
  ],
})
export class CacheModule {}
```

---

### 🟡 ALTO - Índices no Banco de Dados

**Problema**: Schema Prisma não mostra índices explícitos para campos frequentemente consultados.

**Impacto**:

- Queries lentas em grandes volumes de dados
- Degradação de performance

**Solução**:

```prisma
// prisma/schema.prisma
model Product {
  // ... campos existentes

  @@index([slug])
  @@index([isDeleted, isActive])
  @@index([createdAt])
}

model User {
  // ... campos existentes

  @@index([email])
  @@index([isDeleted, isActive])
}

model Customer {
  // ... campos existentes

  @@index([email])
  @@index([taxIdentifier])
  @@index([isDeleted])
}
```

---

### 🟡 ALTO - Paginação em Todas as Listagens

**Problema**: Endpoints de listagem podem não ter paginação adequada.

**Impacto**:

- Carregamento de grandes volumes de dados
- Timeout de requisições
- Alto uso de memória

**Solução**:

```typescript
// Padrão para todos os endpoints de listagem
export class PaginationDTO {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
```

---

### 🟡 ALTO - Health Checks

**Problema**: Não há endpoints de health check.

**Impacto**:

- Dificuldade em monitorar saúde da aplicação
- Load balancers não conseguem verificar status

**Solução**:

```typescript
// src/app.controller.ts
@Get('health')
@Public()
async healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: await this.checkDatabase(),
    cache: await this.checkCache(),
  };
}
```

---

### 🟡 ALTO - Tratamento de Erros do Banco

**Problema**: Erros de banco não são tratados especificamente.

**Impacto**:

- Exposição de informações sensíveis
- Dificuldade em debugar problemas

**Solução**:

```typescript
// src/infra/filters/database-exception.filter.ts
@Catch(PrismaClientKnownRequestError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    // Tratar erros específicos do Prisma
    // Não expor detalhes em produção
  }
}
```

---

### 🟢 MÉDIO - Compressão de Respostas

**Problema**: Respostas não são comprimidas.

**Impacto**:

- Maior uso de banda
- Respostas mais lentas

**Solução**:

```typescript
// Instalar: npm install compression
// src/main.ts
import * as compression from 'compression';

app.use(compression());
```

---

### 🟢 MÉDIO - Query Optimization

**Problema**: Queries podem estar fazendo N+1 ou carregando dados desnecessários.

**Impacto**:

- Performance degradada
- Alto uso de recursos

**Solução**:

```typescript
// Sempre usar include/select explícito no Prisma
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    // apenas campos necessários
  },
  include: {
    categories: {
      select: { id: true, name: true },
    },
  },
});
```

---

### 🟢 MÉDIO - Monitoring e Observability

**Problema**: Falta de métricas e monitoramento.

**Impacto**:

- Dificuldade em identificar gargalos
- Falta de visibilidade em produção

**Solução**:

```typescript
// Instalar: npm install @prometheus/client prom-client
// Implementar métricas Prometheus
// - Request duration
// - Request count
// - Error rate
// - Database query time
// - Cache hit/miss ratio
```

---

### 🟢 MÉDIO - Dockerfile Otimizado

**Problema**: Dockerfile pode ser otimizado.

**Impacto**:

- Imagens maiores que o necessário
- Builds mais lentos

**Solução**:

```dockerfile
# Dockerfile
FROM node:23-alpine AS builder

WORKDIR /app

# Copiar apenas arquivos de dependências primeiro (cache layer)
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copiar código fonte
COPY prisma ./prisma
COPY src ./src
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Build
RUN npx prisma generate
RUN yarn build

# Runtime - imagem mínima
FROM node:23-alpine AS production

WORKDIR /app

# Copiar apenas o necessário
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3333

CMD ["node", "dist/src/main"]
```

---

### 🟢 MÉDIO - Variáveis de Ambiente Seguras

**Problema**: Docker Compose com credenciais hardcoded.

**Impacto**:

- Credenciais expostas
- Dificuldade em gerenciar diferentes ambientes

**Solução**:

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    # Nunca hardcodar credenciais
```

---

## 🎯 PRIORIZAÇÃO

### Fase 1 - Crítico (Implementar Imediatamente)

1. ✅ Rate Limiting
2. ✅ Validação de Email e Senha
3. ✅ Connection Pooling do Prisma
4. ✅ Cache Distribuído (Redis)

### Fase 2 - Alto (Próximas 2 semanas)

1. ✅ Sanitização de Entrada
2. ✅ Logs de Segurança
3. ✅ Índices no Banco de Dados
4. ✅ Paginação
5. ✅ Health Checks

### Fase 3 - Médio (Próximo mês)

1. ✅ Rotação de Tokens JWT
2. ✅ Compressão de Respostas
3. ✅ Query Optimization
4. ✅ Monitoring

---

## 📝 Notas Finais

- **Testes de Carga**: Implementar testes de carga para validar melhorias
- **Documentação**: Documentar todas as mudanças de segurança
- **Code Review**: Revisar código regularmente para vulnerabilidades
- **Dependências**: Manter dependências atualizadas (`npm audit`)
- **Backup**: Implementar backup automático do banco de dados
- **Disaster Recovery**: Ter plano de recuperação de desastres

---

**Última atualização**: 2025-01-23
