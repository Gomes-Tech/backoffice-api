# 📝 Sistema de Logs - Guia Rápido

Sistema de logs avançado com Winston, Sentry, rotação automática e logs estruturados.

## 🚀 Início Rápido

### 1. Configuração

Adicione ao seu `.env`:

```env
# Nível de log
LOG_LEVEL=info

# Sentry (opcional)
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### 2. Uso Básico

```typescript
import { AdvancedLoggerService } from '@infra/logger';

@Injectable()
export class YourService {
  constructor(private readonly logger: AdvancedLoggerService) {
    this.logger.setContext('YourService');
  }

  async yourMethod() {
    this.logger.log('Operação iniciada');
    this.logger.error('Erro ocorreu', error.stack);
    this.logger.warn('Aviso importante');
  }
}
```

## 📊 Funcionalidades

### ✅ Logs em Arquivo (Winston)
- Rotação diária automática
- Compressão de logs antigos
- Múltiplos arquivos: `app`, `error`, `combined`

### ✅ Monitoramento de Erros (Sentry)
- Erros enviados automaticamente
- Stack traces completos
- Filtros de segurança

### ✅ Logs Estruturados
```typescript
this.logger.logStructured('info', 'Operação realizada', {
  userId: '123',
  operation: 'update',
  duration: 150,
});
```

### ✅ Performance Monitoring
```typescript
const start = Date.now();
await operation();
this.logger.logPerformance('operation', Date.now() - start);
```

### ✅ Logs HTTP Automáticos
Todas as requisições são logadas automaticamente com:
- Método, URL, status code
- Tempo de resposta
- IP, User-Agent

## 📁 Estrutura de Logs

```
logs/
├── app-2025-01-15.log          # Logs de aplicação
├── error-2025-01-15.log        # Apenas erros
├── combined-2025-01-15.log     # Todos os logs
├── exceptions.log              # Exceções não capturadas
└── rejections.log              # Promises rejeitadas
```

## 🔍 Métodos Disponíveis

| Método | Descrição | Sentry |
|--------|-----------|--------|
| `log()` | Informações gerais | ❌ |
| `error()` | Erros | ✅ |
| `warn()` | Avisos | ⚠️ (críticos) |
| `debug()` | Debug (dev only) | ❌ |
| `verbose()` | Verbose (dev only) | ❌ |
| `logStructured()` | Logs estruturados | ❌ |
| `logPerformance()` | Performance | ❌ |
| `logHttpRequest()` | Requisições HTTP | ❌ |
| `logDatabaseError()` | Erros de DB | ✅ |

## 📖 Documentação Completa

Veja [docs/LOGGING.md](./LOGGING.md) para:
- Exemplos detalhados
- Configuração avançada
- Integração com Sentry
- Boas práticas
- Troubleshooting

## 🎯 Exemplos Práticos

### Operação Completa
```typescript
async processOrder(orderId: string) {
  const start = Date.now();
  
  try {
    this.logger.log(`Processando pedido: ${orderId}`);
    
    const order = await this.findOrder(orderId);
    const payment = await this.processPayment(order);
    
    this.logger.logPerformance('processOrder', Date.now() - start, {
      orderId,
      paymentId: payment.id,
    });
    
    return order;
  } catch (error) {
    this.logger.error(`Erro ao processar pedido ${orderId}`, error.stack);
    throw error;
  }
}
```

### Erro de Banco de Dados
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

### Log de Auditoria
```typescript
this.logger.logStructured('info', 'Registro de auditoria', {
  action: 'UPDATE',
  resource: 'users',
  userId: '123',
  changes: { before: {...}, after: {...} },
});
```

## 🛡️ Segurança

O sistema **automaticamente remove** informações sensíveis:
- Headers: `authorization`, `cookie`, `x-api-key`
- Query params: `password`, `token`, `secret`
- Dados do usuário: `email`, `ip_address`

## 🔧 Troubleshooting

### Logs não aparecem em arquivo
- Verifique se a pasta `logs/` existe
- Verifique permissões de escrita

### Sentry não recebe erros
- Verifique se `SENTRY_DSN` está configurado
- Verifique a conexão com internet

### Logs muito verbosos
Ajuste `LOG_LEVEL` no `.env`:
- `error` - Apenas erros
- `warn` - Avisos e erros
- `info` - Padrão (recomendado)
- `debug` - Desenvolvimento
- `verbose` - Muito detalhado

## 📦 Dependências

- `winston` - Logs em arquivo
- `winston-daily-rotate-file` - Rotação automática
- `nest-winston` - Integração com NestJS
- `@sentry/node` - Monitoramento de erros
- `@sentry/profiling-node` - Profiling de performance

## 🌟 Recursos

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Sentry Documentation](https://docs.sentry.io/)
- [NestJS Logging](https://docs.nestjs.com/techniques/logger)

---

**Dica**: Use `AdvancedLoggerService` para ter acesso a todas as funcionalidades!
