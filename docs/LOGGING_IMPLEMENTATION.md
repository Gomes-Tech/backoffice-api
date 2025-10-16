# 🎉 Sistema de Logs Avançado - Implementação Completa

## ✅ O que foi implementado

### 1. **Winston Logger** - Logs em Arquivo
- ✅ Configuração completa do Winston
- ✅ Rotação diária automática de logs
- ✅ Compressão de logs antigos (.gz)
- ✅ Múltiplos arquivos de log:
  - `app-YYYY-MM-DD.log` - Logs de aplicação (7 dias)
  - `error-YYYY-MM-DD.log` - Apenas erros (14 dias)
  - `combined-YYYY-MM-DD.log` - Todos os logs (30 dias)
  - `exceptions.log` - Exceções não capturadas
  - `rejections.log` - Promises rejeitadas
- ✅ Tamanho máximo de 20MB por arquivo
- ✅ Formato JSON estruturado

### 2. **Sentry Integration** - Monitoramento de Erros
- ✅ Configuração completa do Sentry
- ✅ Envio automático de erros
- ✅ Profiling de performance
- ✅ Filtros de segurança (remove dados sensíveis)
- ✅ Breadcrumbs (rastro de eventos)
- ✅ Funções auxiliares:
  - `captureException()` - Captura exceções
  - `captureMessage()` - Captura mensagens
  - `setUser()` - Define usuário no contexto
  - `addBreadcrumb()` - Adiciona rastro de eventos
  - `startTransaction()` - Inicia transação de performance

### 3. **Logs Estruturados** - Formato JSON
- ✅ `logStructured()` - Logs customizados em JSON
- ✅ `logPerformance()` - Logs de performance
- ✅ `logHttpRequest()` - Logs de requisições HTTP
- ✅ `logDatabaseError()` - Logs de erros de banco de dados
- ✅ Metadados automáticos (timestamp, contexto, ambiente)

### 4. **Advanced Logger Service**
- ✅ Todos os métodos do logger básico
- ✅ Integração com Winston
- ✅ Integração com Sentry
- ✅ Logs estruturados
- ✅ Detecção automática de operações lentas
- ✅ Detecção de avisos críticos de segurança

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
```
src/infra/logger/
├── winston.config.ts              # Configuração do Winston
├── sentry.config.ts               # Configuração do Sentry
├── advanced-logger.service.ts     # Logger avançado
├── advanced-logger.example.ts     # Exemplos práticos

docs/
├── LOGGING.md                     # Documentação completa
└── LOGGING_QUICK_START.md         # Guia rápido
```

### Arquivos Modificados
```
src/infra/logger/
├── logging.interceptor.ts         # Atualizado para usar AdvancedLogger
├── logger.module.ts               # Adicionado AdvancedLogger
└── index.ts                       # Exportações atualizadas

src/
├── main.ts                        # Inicialização do Sentry

.env.example                       # Variáveis de ambiente adicionadas
```

## 📦 Dependências Instaladas

```json
{
  "winston": "^3.x",
  "winston-daily-rotate-file": "^5.x",
  "nest-winston": "^1.x",
  "@sentry/node": "^10.x",
  "@sentry/profiling-node": "^10.x"
}
```

## 🚀 Como Usar

### 1. Configurar Variáveis de Ambiente

Adicione ao seu `.env`:

```env
# Logging
LOG_LEVEL=info

# Sentry (opcional)
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
```

### 2. Usar o Logger Avançado

```typescript
import { Injectable } from '@nestjs/common';
import { AdvancedLoggerService } from '@infra/logger';

@Injectable()
export class YourService {
  constructor(private readonly logger: AdvancedLoggerService) {
    this.logger.setContext('YourService');
  }

  async yourMethod() {
    const start = Date.now();
    
    this.logger.log('Operação iniciada');
    
    try {
      // Sua lógica aqui
      const result = await this.doSomething();
      
      // Log de performance
      this.logger.logPerformance('yourMethod', Date.now() - start);
      
      return result;
    } catch (error) {
      // Erro enviado automaticamente para o Sentry
      this.logger.error('Erro na operação', error.stack);
      throw error;
    }
  }
}
```

### 3. Logs Estruturados

```typescript
this.logger.logStructured('info', 'Usuário criado', {
  userId: '123',
  email: 'user@example.com',
  role: 'admin',
});
```

### 4. Log de Erro de Banco de Dados

```typescript
try {
  await this.prisma.user.create(data);
} catch (error) {
  this.logger.logDatabaseError('createUser', error, {
    table: 'users',
    operation: 'create',
  });
  throw error;
}
```

## 🎯 Funcionalidades Principais

### ✅ Logs Automáticos de HTTP
Todas as requisições são logadas automaticamente:
- Método, URL, IP, User-Agent
- Body, Query Params, Route Params (em debug)
- Status code e tempo de resposta
- Erros com stack trace

### ✅ Rotação Automática de Logs
- Novos arquivos criados diariamente
- Logs antigos compactados automaticamente
- Retenção configurável por tipo de log
- Tamanho máximo por arquivo

### ✅ Monitoramento de Erros (Sentry)
- Erros enviados automaticamente
- Stack traces completos
- Contexto da aplicação
- Filtros de segurança
- Dashboard em tempo real

### ✅ Logs Estruturados (JSON)
- Formato padronizado
- Fácil busca e análise
- Metadados automáticos
- Integração com ferramentas de análise

### ✅ Performance Monitoring
- Detecção de operações lentas (>5s)
- Logs de performance customizados
- Profiling com Sentry
- Métricas detalhadas

## 🛡️ Segurança

O sistema **remove automaticamente** informações sensíveis antes de enviar para o Sentry:

- **Headers**: `authorization`, `cookie`, `x-api-key`
- **Query Params**: `password`, `token`, `api_key`, `secret`
- **Dados do Usuário**: `email`, `ip_address`

## 📊 Estrutura de Logs

### Console (Desenvolvimento)
```
[2025-01-15 10:30:45] [UserService] LOG Usuário criado com sucesso
[2025-01-15 10:30:46] [HTTP] LOG Response: POST /api/users - Status: 201 - 150ms
```

### Arquivo (JSON)
```json
{
  "level": "info",
  "message": "Usuário criado com sucesso",
  "context": "UserService",
  "timestamp": "2025-01-15 10:30:45",
  "environment": "development",
  "data": {
    "userId": "123",
    "email": "user@example.com"
  }
}
```

## 📖 Documentação

- **Guia Rápido**: [docs/LOGGING_QUICK_START.md](./LOGGING_QUICK_START.md)
- **Documentação Completa**: [docs/LOGGING.md](./LOGGING.md)
- **Exemplos Práticos**: [src/infra/logger/advanced-logger.example.ts](../src/infra/logger/advanced-logger.example.ts)

## 🔧 Configuração Avançada

### Níveis de Log

Configure `LOG_LEVEL` no `.env`:

- `error` - Apenas erros
- `warn` - Avisos e erros
- `info` - Informações, avisos e erros (padrão)
- `debug` - Tudo, incluindo debug
- `verbose` - Tudo, incluindo verbose

### Ambientes

#### Desenvolvimento
- Todos os níveis de log ativos
- Logs de debug e verbose exibidos
- Response data logado
- Console colorido

#### Produção
- Logs de debug e verbose desabilitados
- Response data não logado
- Apenas logs essenciais
- Logs em arquivo + Sentry

## 🎓 Boas Práticas

1. **Sempre defina o contexto**
   ```typescript
   constructor(private readonly logger: AdvancedLoggerService) {
     this.logger.setContext('YourService');
   }
   ```

2. **Use o nível apropriado**
   - `log()` para operações importantes
   - `error()` para erros
   - `warn()` para avisos
   - `debug()` para desenvolvimento

3. **Não logue informações sensíveis**
   - Senhas, tokens, chaves de API
   - Dados pessoais sensíveis

4. **Use logs estruturados para análise**
   ```typescript
   this.logger.logStructured('info', 'Operação', { key: 'value' });
   ```

5. **Monitore performance de operações críticas**
   ```typescript
   this.logger.logPerformance('operation', duration);
   ```

## 🚨 Troubleshooting

### Logs não aparecem em arquivo
- Verifique se a pasta `logs/` existe (criada automaticamente)
- Verifique permissões de escrita
- Verifique se `NODE_ENV !== 'test'`

### Sentry não recebe erros
- Verifique se `SENTRY_DSN` está configurado
- Verifique a conexão com internet
- Verifique se o DSN está correto
- Verifique os logs do console

### Logs muito verbosos
- Ajuste `LOG_LEVEL` no `.env`
- Em produção, use `LOG_LEVEL=warn` ou `LOG_LEVEL=error`

## 🌟 Próximos Passos

1. **Configure o Sentry**
   - Crie uma conta em [sentry.io](https://sentry.io/)
   - Crie um projeto Node.js
   - Copie o DSN para o `.env`

2. **Teste o Sistema**
   - Execute a aplicação
   - Verifique os logs no console
   - Verifique os arquivos em `logs/`
   - Teste o envio de erros para o Sentry

3. **Integre com Ferramentas de Análise**
   - Elasticsearch + Kibana
   - Grafana + Loki
   - CloudWatch (AWS)
   - Google Cloud Logging

4. **Configure Alertas**
   - Alertas de erros críticos no Sentry
   - Alertas de operações lentas
   - Alertas de segurança

## 📞 Suporte

- **Winston**: https://github.com/winstonjs/winston
- **Sentry**: https://docs.sentry.io/
- **NestJS Logging**: https://docs.nestjs.com/techniques/logger

---

**🎉 Sistema de Logs Avançado implementado com sucesso!**

Agora você tem:
- ✅ Logs em arquivo com rotação automática
- ✅ Monitoramento de erros em tempo real
- ✅ Logs estruturados em JSON
- ✅ Performance monitoring
- ✅ Segurança e filtros automáticos
