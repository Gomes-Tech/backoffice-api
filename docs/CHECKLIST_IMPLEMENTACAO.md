# ✅ Checklist de Implementação - Melhorias de Segurança e Escalabilidade

Use este checklist para acompanhar o progresso das melhorias.

---

## 🔴 FASE 1: CRÍTICO (Implementar Imediatamente)

### 1. Rate Limiting

- [x] Instalar `@nestjs/throttler`
- [x] Criar módulo de throttler
- [x] Configurar limites por endpoint:
  - [x] Login: 5 tentativas / 15 min (via @ThrottleLogin)
  - [x] API geral: 100 req / min
  - [x] Upload: 10 / hora (via @ThrottleUpload)
- [ ] Testar rate limiting
- [ ] Documentar configurações

### 2. Validação de Email e Senha

- [x] Adicionar `@IsEmail` em DTOs de criação
- [x] Adicionar validação de senha forte:
  - [x] Mínimo 8 caracteres
  - [x] Letras maiúsculas
  - [x] Letras minúsculas
  - [x] Números
- [x] Atualizar DTOs:
  - [x] `CreateCustomerDTO`
  - [x] `CreateUserDto`
  - [x] Outros DTOs com email/senha
- [ ] Testar validações
- [ ] Atualizar documentação da API

### 3. Connection Pooling do Prisma

- [x] Configurar pool no `DATABASE_URL`:
  - [x] `connection_limit=20`
  - [x] `pool_timeout=20`
- [x] Atualizar `PrismaService` com logs
- [x] Adicionar `onModuleDestroy` para desconectar
- [ ] Testar com múltiplas conexões
- [ ] Monitorar uso de conexões

### 4. Cache Distribuído (Redis)

- [x] Instalar Redis (Docker ou serviço gerenciado)
- [x] Instalar `cache-manager-redis-store`
- [x] Atualizar `CacheModule` para usar Redis
- [x] Configurar variáveis de ambiente:
  - [x] `REDIS_HOST`
  - [x] `REDIS_PORT`
  - [x] `REDIS_PASSWORD` (se necessário)
- [x] Migrar cache existente
- [ ] Testar cache distribuído
- [ ] Atualizar docker-compose.yml

---

## 🟡 FASE 2: ALTO (Próximas 2 Semanas)

### 5. Sanitização de Entrada

- [x] Instalar `sanitize-html` ou `dompurify`
- [x] Criar utilitário de sanitização
- [x] Aplicar sanitização em DTOs críticos:
  - [x] Campos de texto livre
  - [x] Descrições
  - [x] Nomes (se necessário)
- [ ] Testar sanitização
- [ ] Documentar campos sanitizados

### 6. Logs de Segurança

- [x] Criar `SecurityLoggerService`
- [x] Implementar métodos:
  - [x] `logFailedLogin()`
  - [x] `logSuspiciousActivity()`
  - [x] `logSecurityEvent()`
  - [x] `logUnauthorizedAccess()`
  - [x] `logInvalidToken()`
  - [x] `logPasswordResetAttempt()`
  - [x] `logSuccessfulLogin()`
  - [x] `logForbiddenAccess()`
  - [x] `logBruteForceAttempt()`
- [x] Integrar em:
  - [x] Guards de autenticação (AuthGuard, CustomerAuthGuard, RolesGuard)
  - [x] Endpoints sensíveis (sign-in, reset-password)
- [x] Configurar alertas (integração opcional com Sentry)
- [ ] Testar logs

### 7. Proteção Contra Timing Attacks

- [x] Criar função `secureCompare()` usando `crypto.timingSafeEqual()`
- [x] Aplicar em `AuthServerGuard` para comparação de API keys
- [x] Verificar que comparações de senha já são seguras (bcrypt)
- [x] Documentar implementação
- [ ] Criar testes unitários
- [ ] Testar em diferentes cenários

### 8. Índices no Banco de Dados

- [x] Analisar queries mais lentas
- [x] Adicionar índices no schema:
  - [x] `Product.slug`
  - [x] `Product.isDeleted`
  - [x] `Product.createdAt`
  - [x] `User.email`
  - [x] `User.isDeleted, isActive` (índice composto)
  - [x] `Customer.email`
  - [x] `Customer.taxIdentifier`
  - [x] `Customer.isDeleted`
  - [x] `Category.slug`
  - [x] `Category.isDeleted, isActive` (índice composto)
- [x] Criar migration
- [ ] Testar performance
- [ ] Monitorar uso de índices

### 8. Paginação Completa

- [x] Criar `PaginationDTO` padrão (interface `PaginatedResponse` e `BaseFindFilters`)
- [x] Verificar todos os endpoints de listagem:
  - [x] Products (tem skip/take)
  - [ ] Users
  - [ ] Customers
  - [x] Categories (tem skip/take)
  - [ ] Outros
- [ ] Implementar paginação onde faltar
- [ ] Adicionar validação de limites
- [ ] Testar paginação
- [ ] Atualizar documentação

### 9. Health Checks

- [x] Criar endpoint `/api/health`
- [x] Implementar verificações:
  - [x] Status da aplicação
  - [x] Conexão com banco
  - [x] Conexão com cache
  - [x] Uptime
- [x] Adicionar endpoint `/api/health/live` (liveness)
- [x] Adicionar endpoint `/api/health/ready` (readiness)
- [x] Criar HealthCheckService com verificações de performance
- [ ] Configurar no load balancer (se aplicável)
- [ ] Testar health checks

---

## 🟢 FASE 3: MÉDIO (Próximo Mês)

### 10. Rotação de Tokens JWT

- [x] Criar `TokenBlacklistService`
- [x] Implementar blacklist no cache
- [x] Adicionar JTI (JWT ID) aos tokens
- [x] Implementar logout que blacklista token
- [x] Verificar blacklist nos guards
- [x] Atualizar refresh token para invalidar token antigo
- [ ] Testar rotação
- [ ] Documentar fluxo

### 11. Compressão de Respostas

- [x] Instalar `compression`
- [x] Configurar no `main.ts`
- [x] Configurar filtro para tipos de conteúdo apropriados
- [x] Configurar nível de compressão (6) e threshold (1KB)
- [ ] Testar compressão
- [ ] Verificar redução de tamanho

### 12. Query Optimization

- [x] Auditar queries do Prisma
- [x] Adicionar `select` explícito (maioria já implementado)
- [x] Evitar N+1 queries (otimizado `findBySlug` em CategoryRepository)
- [x] Usar `include` apenas quando necessário
- [x] Criar documento com padrões de otimização (`QUERY_OPTIMIZATION_PATTERNS.md`)
- [ ] Testar performance
- [ ] Revisar outros repositórios para oportunidades de otimização

### 13. Monitoring

- [x] Instalar `prom-client`
- [x] Implementar métricas:
  - [x] Request duration
  - [x] Request count
  - [x] Error rate
  - [x] Database query time
  - [x] Cache hit/miss
- [x] Expor endpoint `/api/metrics`
- [x] Configurar Grafana
- [x] Documentar métricas

---

## 🔧 MELHORIAS ADICIONAIS

### Configuração do Helmet

- [x] Configurar CSP (Content Security Policy)
- [x] Ajustar headers de segurança
- [ ] Testar em diferentes navegadores

### Headers de Segurança

- [x] Adicionar `X-Content-Type-Options` (via Helmet)
- [x] Adicionar `X-Frame-Options` (via Helmet)
- [x] Adicionar `X-XSS-Protection` (via Helmet)
- [x] Adicionar `Referrer-Policy` (via Helmet)
- [x] Adicionar `Permissions-Policy` (via Helmet)
- [x] Adicionar `HSTS` (apenas em produção)

### CORS Dinâmico

- [x] Mover origens para variáveis de ambiente (atualmente hardcoded no main.ts)
- [x] Configurar `ALLOWED_ORIGINS`
- [ ] Testar CORS

### Timeout de Requisições

- [x] Configurar timeout (30s)
- [ ] Testar timeout
- [ ] Ajustar se necessário

### Validação de Tamanho de Payload

- [x] Configurar limite (10mb)
- [ ] Testar limites
- [ ] Ajustar se necessário

### Dockerfile Otimizado

- [ ] Otimizar layers
- [ ] Usar usuário não-root
- [ ] Reduzir tamanho da imagem
- [ ] Testar build

### Proteção de Dados Sensíveis

- [x] Sanitizar logs (implementado no HttpExceptionFilter)
- [x] Remover dados sensíveis de respostas (implementado no HttpExceptionFilter)
- [x] Implementar máscara de dados (campos sensíveis são mascarados como [REDACTED])
- [ ] Testar sanitização

---

## 📊 TESTES

### Testes de Segurança

- [ ] Testar rate limiting
- [ ] Testar validações
- [ ] Testar sanitização
- [ ] Testar autenticação/autorização
- [ ] Testar CORS

### Testes de Performance

- [ ] Teste de carga (stress test)
- [ ] Teste de conexões simultâneas
- [ ] Teste de cache
- [ ] Teste de queries otimizadas

### Testes de Integração

- [ ] Testar health checks
- [ ] Testar monitoring
- [ ] Testar compressão

---

## 📝 DOCUMENTAÇÃO

- [ ] Atualizar README com novas configurações
- [ ] Documentar variáveis de ambiente
- [ ] Atualizar documentação da API (Swagger)
- [ ] Criar guia de deployment
- [ ] Documentar monitoramento

---

## 🚀 DEPLOYMENT

- [ ] Atualizar variáveis de ambiente em produção
- [ ] Configurar Redis em produção
- [ ] Atualizar docker-compose ou orquestração
- [ ] Configurar health checks no load balancer
- [ ] Configurar monitoramento
- [ ] Testar em ambiente de staging
- [ ] Deploy em produção
- [ ] Monitorar após deploy

---

## 📅 Acompanhamento

**Data de início**: **\*\***\_\_\_**\*\***
**Data prevista de conclusão Fase 1**: **\*\***\_\_\_**\*\***
**Data prevista de conclusão Fase 2**: **\*\***\_\_\_**\*\***
**Data prevista de conclusão Fase 3**: **\*\***\_\_\_**\*\***

**Responsável**: **\*\***\_\_\_**\*\***
**Revisado por**: **\*\***\_\_\_**\*\***

---

**Última atualização**: 2025-01-23
