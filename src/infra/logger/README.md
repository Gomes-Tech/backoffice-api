# Logger Module

Sistema de logs avançado com Winston, Sentry, rotação automática e logs estruturados.

## 📚 Documentação

- **[Guia de Instalação](../../../docs/LOGGING_SETUP.md)** - Como configurar e começar a usar
- **[Guia Rápido](../../../docs/LOGGING_QUICK_START.md)** - Referência rápida
- **[Documentação Completa](../../../docs/LOGGING.md)** - Guia detalhado com exemplos
- **[Detalhes da Implementação](../../../docs/LOGGING_IMPLEMENTATION.md)** - Arquitetura e funcionalidades

## 🚀 Uso Rápido

```typescript
import { AdvancedLoggerService } from '@infra/logger';

@Injectable()
export class YourService {
  constructor(private readonly logger: AdvancedLoggerService) {
    this.logger.setContext('YourService');
  }

  async yourMethod() {
    this.logger.log('Operação iniciada');
    
    try {
      const result = await this.doSomething();
      this.logger.logPerformance('yourMethod', Date.now() - start);
      return result;
    } catch (error) {
      this.logger.error('Erro na operação', error.stack);
      throw error;
    }
  }
}
```

## 📁 Arquivos

- `logger.service.ts` - Logger básico (console colorido)
- `advanced-logger.service.ts` - Logger avançado (Winston + Sentry)
- `logging.interceptor.ts` - Interceptor HTTP automático
- `logger.module.ts` - Módulo global
- `winston.config.ts` - Configuração do Winston
- `sentry.config.ts` - Configuração do Sentry
- `advanced-logger.example.ts` - Exemplos práticos

## ✨ Funcionalidades

- ✅ Logs em arquivo com rotação diária
- ✅ Monitoramento de erros com Sentry
- ✅ Logs estruturados em JSON
- ✅ Performance monitoring
- ✅ HTTP logging automático
- ✅ Filtros de segurança

## 🔧 Configuração

Adicione ao `.env`:

```env
LOG_LEVEL=info
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=development
```

Veja o [Guia de Instalação](../../../docs/LOGGING_SETUP.md) para mais detalhes.
