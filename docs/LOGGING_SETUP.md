# 🚀 Sistema de Logs Avançado - Instalação e Configuração

## ✅ Implementação Completa

O sistema de logs avançado foi implementado com sucesso! Agora você tem:

- ✅ **Winston** - Logs em arquivo com rotação diária
- ✅ **Sentry** - Monitoramento de erros em tempo real
- ✅ **Rotação de Logs** - Gerenciamento automático de arquivos
- ✅ **Logs Estruturados** - Formato JSON para análise
- ✅ **Performance Monitoring** - Rastreamento de operações
- ✅ **HTTP Logging** - Registro automático de requisições

## 📦 Dependências Instaladas

As seguintes dependências foram instaladas:

```bash
yarn add winston winston-daily-rotate-file nest-winston @sentry/node @sentry/profiling-node
```

## 🔧 Configuração Necessária

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Nível de log (error, warn, info, debug, verbose)
LOG_LEVEL=info

# Sentry - Monitoramento de Erros (OPCIONAL)
# Obtenha seu DSN em: https://sentry.io/
SENTRY_DSN=
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1

# Ambiente
NODE_ENV=development
```

### 2. Configurar Sentry (Opcional, mas Recomendado)

O Sentry é **opcional**, mas altamente recomendado para produção:

1. Acesse [sentry.io](https://sentry.io/)
2. Crie uma conta gratuita
3. Crie um novo projeto (Node.js)
4. Copie o DSN fornecido
5. Cole no arquivo `.env` na variável `SENTRY_DSN`

**Nota**: Se você não configurar o Sentry, o sistema funcionará normalmente, apenas sem o monitoramento de erros em tempo real.

## 🚀 Como Usar

### Opção 1: Logger Básico (Console Colorido)

```typescript
import { CustomLoggerService } from '@infra/logger';

@Injectable()
export class YourService {
  constructor(private readonly logger: CustomLoggerService) {
    this.logger.setContext('YourService');
  }

  yourMethod() {
    this.logger.log('Mensagem de log');
    this.logger.error('Mensagem de erro', error.stack);
    this.logger.warn('Mensagem de aviso');
  }
}
```

### Opção 2: Logger Avançado (Recomendado)

```typescript
import { AdvancedLoggerService } from '@infra/logger';

@Injectable()
export class YourService {
  constructor(private readonly logger: AdvancedLoggerService) {
    this.logger.setContext('YourService');
  }

  async yourMethod() {
    const start = Date.now();
    
    // Log básico
    this.logger.log('Operação iniciada');
    
    try {
      // Sua lógica aqui
      const result = await this.doSomething();
      
      // Log de performance
      this.logger.logPerformance('yourMethod', Date.now() - start);
      
      // Log estruturado
      this.logger.logStructured('info', 'Operação concluída', {
        duration: Date.now() - start,
        result: 'success',
      });
      
      return result;
    } catch (error) {
      // Erro enviado automaticamente para o Sentry (se configurado)
      this.logger.error('Erro na operação', error.stack);
      throw error;
    }
  }
}
```

## 📁 Estrutura de Arquivos de Log

Os logs são salvos automaticamente na pasta `logs/`:

```
logs/
├── app-2025-01-15.log          # Logs de aplicação (mantido por 7 dias)
├── error-2025-01-15.log        # Apenas erros (mantido por 14 dias)
├── combined-2025-01-15.log     # Todos os logs (mantido por 30 dias)
├── exceptions.log              # Exceções não capturadas
└── rejections.log              # Promises rejeitadas
```

**Características**:
- Rotação diária automática
- Compressão de logs antigos (.gz)
- Tamanho máximo de 20MB por arquivo
- Formato JSON estruturado

## 🎯 Funcionalidades Principais

### 1. Logs Automáticos de HTTP

Todas as requisições HTTP são logadas automaticamente:

```
[2025-01-15 10:30:45] [HTTP] LOG Incoming Request: POST /api/users - IP: ::1
[2025-01-15 10:30:45] [HTTP] LOG Response: POST /api/users - Status: 201 - 150ms
```

### 2. Logs Estruturados

```typescript
this.logger.logStructured('info', 'Usuário criado', {
  userId: '123',
  email: 'user@example.com',
  role: 'admin',
  timestamp: new Date().toISOString(),
});
```

### 3. Performance Monitoring

```typescript
const start = Date.now();
await this.heavyOperation();
this.logger.logPerformance('heavyOperation', Date.now() - start);
```

**Alerta automático**: Se a operação demorar mais de 5 segundos, um aviso é gerado.

### 4. Logs de Erro de Banco de Dados

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

## 🛡️ Segurança

O sistema **remove automaticamente** informações sensíveis antes de enviar para o Sentry:

- Headers: `authorization`, `cookie`, `x-api-key`
- Query params: `password`, `token`, `api_key`, `secret`
- Dados do usuário: `email`, `ip_address`

## 📖 Documentação

- **Guia Rápido**: [LOGGING_QUICK_START.md](./LOGGING_QUICK_START.md)
- **Documentação Completa**: [LOGGING.md](./LOGGING.md)
- **Detalhes da Implementação**: [LOGGING_IMPLEMENTATION.md](./LOGGING_IMPLEMENTATION.md)
- **Exemplos Práticos**: [../src/infra/logger/advanced-logger.example.ts](../src/infra/logger/advanced-logger.example.ts)

## 🔍 Métodos Disponíveis

### Logger Básico (CustomLoggerService)
- `log(message, context?)` - Informações gerais
- `error(message, trace?, context?)` - Erros
- `warn(message, context?)` - Avisos
- `debug(message, context?)` - Debug (dev only)
- `verbose(message, context?)` - Verbose (dev only)

### Logger Avançado (AdvancedLoggerService)
Todos os métodos acima, mais:
- `logStructured(level, message, data?)` - Logs estruturados
- `logPerformance(operation, duration, metadata?)` - Performance
- `logHttpRequest(method, url, statusCode, duration, metadata?)` - HTTP
- `logDatabaseError(operation, error, metadata?)` - Erros de DB

## 🚨 Troubleshooting

### Logs não aparecem em arquivo
- A pasta `logs/` é criada automaticamente
- Verifique permissões de escrita
- Logs em arquivo são desabilitados em testes (`NODE_ENV=test`)

### Sentry não recebe erros
- Verifique se `SENTRY_DSN` está configurado no `.env`
- Verifique a conexão com internet
- Verifique se o DSN está correto
- O Sentry é opcional - o sistema funciona sem ele

### Logs muito verbosos
Ajuste `LOG_LEVEL` no `.env`:
- `error` - Apenas erros
- `warn` - Avisos e erros
- `info` - Padrão (recomendado)
- `debug` - Desenvolvimento
- `verbose` - Muito detalhado

### Erro de TypeScript no Sentry
Se você ver erros de TypeScript relacionados ao Sentry, execute:
```bash
yarn build
```
Isso recompilará o projeto e resolverá problemas de cache.

## 🎓 Boas Práticas

1. **Sempre defina o contexto no construtor**
   ```typescript
   constructor(private readonly logger: AdvancedLoggerService) {
     this.logger.setContext('YourService');
   }
   ```

2. **Use o nível apropriado de log**
   - `log()` → Operações importantes
   - `error()` → Erros (enviado para Sentry)
   - `warn()` → Avisos
   - `debug()` → Desenvolvimento
   - `verbose()` → Informações detalhadas

3. **Não logue informações sensíveis**
   - Senhas, tokens, chaves de API
   - Dados de cartão de crédito
   - Informações pessoais sensíveis

4. **Use logs estruturados para análise**
   ```typescript
   this.logger.logStructured('info', 'Operação', {
     key: 'value',
     timestamp: new Date().toISOString(),
   });
   ```

5. **Monitore performance de operações críticas**
   ```typescript
   const start = Date.now();
   await criticalOperation();
   this.logger.logPerformance('criticalOperation', Date.now() - start);
   ```

## 🌟 Próximos Passos

1. **Teste o Sistema**
   ```bash
   yarn start:dev
   ```
   - Acesse `http://localhost:3333/api`
   - Verifique os logs no console
   - Verifique os arquivos em `logs/`

2. **Configure o Sentry (Opcional)**
   - Crie uma conta em [sentry.io](https://sentry.io/)
   - Configure o DSN no `.env`
   - Teste o envio de erros

3. **Integre nos seus Services**
   - Substitua `CustomLoggerService` por `AdvancedLoggerService`
   - Adicione logs estruturados
   - Monitore performance

4. **Configure Alertas**
   - Configure alertas no Sentry
   - Monitore operações lentas
   - Acompanhe erros críticos

## 📞 Recursos

- **Winston**: https://github.com/winstonjs/winston
- **Sentry**: https://docs.sentry.io/
- **NestJS Logging**: https://docs.nestjs.com/techniques/logger

---

**🎉 Pronto para usar!**

O sistema de logs está completamente configurado e pronto para uso. Comece usando o `AdvancedLoggerService` nos seus services e aproveite todas as funcionalidades!

**Dúvidas?** Consulte a documentação completa em [LOGGING.md](./LOGGING.md)
