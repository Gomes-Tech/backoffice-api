# Sistema de Logs Avançado

Este projeto utiliza um sistema de logs robusto com múltiplas funcionalidades:

- ✅ **Winston** - Logs em arquivo com rotação automática
- ✅ **Sentry** - Monitoramento de erros em tempo real
- ✅ **Rotação de Logs** - Gerenciamento automático de arquivos de log
- ✅ **Logs Estruturados** - Formato JSON para análise e busca
- ✅ **Logs Coloridos** - Console colorido para melhor visualização
- ✅ **Performance Monitoring** - Rastreamento de operações lentas
- ✅ **HTTP Logging** - Registro automático de todas as requisições

## 📋 Índice

1. [Configuração](#configuração)
2. [Níveis de Log](#níveis-de-log)
3. [Como Usar](#como-usar)
4. [Logs em Arquivo](#logs-em-arquivo)
5. [Integração com Sentry](#integração-com-sentry)
6. [Logs Estruturados](#logs-estruturados)
7. [Performance Monitoring](#performance-monitoring)
8. [Boas Práticas](#boas-práticas)

---

## Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Nível de log (error, warn, info, debug, verbose)
LOG_LEVEL=info

# Sentry (opcional, mas recomendado para produção)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1

# Ambiente
NODE_ENV=development
```

### Obter DSN do Sentry

1. Acesse [sentry.io](https://sentry.io/)
2. Crie uma conta ou faça login
3. Crie um novo projeto (Node.js)
4. Copie o DSN fornecido
5. Cole no arquivo `.env`

---

## Níveis de Log

### 1. **LOG** (Verde) - `info`
Usado para informações gerais e importantes do fluxo da aplicação.

```typescript
this.logger.log('Usuário criado com sucesso');
```

### 2. **ERROR** (Vermelho) - `error`
Usado para erros e exceções. **Automaticamente enviado para o Sentry**.

```typescript
this.logger.error('Erro ao criar usuário', error.stack);
```

### 3. **WARN** (Amarelo) - `warn`
Usado para avisos. **Avisos críticos são enviados para o Sentry**.

```typescript
this.logger.warn('Tentativa de acesso não autorizado');
```

### 4. **DEBUG** (Roxo) - `debug`
Usado para informações de debug (desabilitado em produção).

```typescript
this.logger.debug('Dados recebidos:', data);
```

### 5. **VERBOSE** (Branco) - `verbose`
Usado para informações muito detalhadas (desabilitado em produção).

```typescript
this.logger.verbose('Detalhes da requisição:', request);
```

---

## Como Usar

### 1. Logger Básico (CustomLoggerService)

Para uso simples com logs coloridos no console:

```typescript
import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '@infra/logger';

@Injectable()
export class UserService {
  constructor(private readonly logger: CustomLoggerService) {
    this.logger.setContext('UserService');
  }

  async createUser(data: CreateUserDto) {
    this.logger.log('Iniciando criação de usuário');
    this.logger.debug('Dados recebidos:', data);

    try {
      const user = await this.userRepository.create(data);
      this.logger.log(`Usuário criado: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error('Erro ao criar usuário', error.stack);
      throw error;
    }
  }
}
```

### 2. Logger Avançado (AdvancedLoggerService)

Para uso com Winston, Sentry e logs estruturados:

```typescript
import { Injectable } from '@nestjs/common';
import { AdvancedLoggerService } from '@infra/logger';

@Injectable()
export class ProductService {
  constructor(private readonly logger: AdvancedLoggerService) {
    this.logger.setContext('ProductService');
  }

  async createProduct(data: CreateProductDto) {
    const startTime = Date.now();

    try {
      const product = await this.productRepository.create(data);
      
      // Log de performance
      this.logger.logPerformance(
        'createProduct',
        Date.now() - startTime,
        { productId: product.id }
      );

      return product;
    } catch (error) {
      // Log de erro de banco de dados (enviado para Sentry)
      this.logger.logDatabaseError('createProduct', error, {
        data,
      });
      throw error;
    }
  }
}
```

---

## Logs em Arquivo

### Estrutura de Arquivos

Os logs são salvos automaticamente na pasta `logs/`:

```
logs/
├── app-2025-01-15.log          # Logs de aplicação (info+)
├── combined-2025-01-15.log     # Todos os logs
├── error-2025-01-15.log        # Apenas erros
├── exceptions.log              # Exceções não capturadas
└── rejections.log              # Promises rejeitadas
```

### Rotação Automática

- **Rotação diária**: Novos arquivos são criados a cada dia
- **Compressão**: Logs antigos são compactados (.gz)
- **Retenção**:
  - Logs de erro: 14 dias
  - Logs combinados: 30 dias
  - Logs de aplicação: 7 dias
- **Tamanho máximo**: 20MB por arquivo

### Formato dos Logs

Os logs em arquivo são salvos em formato JSON estruturado:

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

---

## Integração com Sentry

### O que é enviado para o Sentry?

1. **Todos os erros** (`logger.error()`)
2. **Avisos críticos** (contendo palavras-chave de segurança)
3. **Erros de banco de dados** (`logger.logDatabaseError()`)
4. **Exceções não capturadas**
5. **Promises rejeitadas**

### Informações Filtradas

Por segurança, as seguintes informações são **removidas** antes de enviar para o Sentry:

- Headers: `authorization`, `cookie`, `x-api-key`
- Query params: `password`, `token`, `api_key`, `secret`
- Dados do usuário: `email`, `ip_address`

### Funções Auxiliares do Sentry

```typescript
import { 
  captureException, 
  captureMessage, 
  setUser, 
  addBreadcrumb 
} from '@infra/logger';

// Capturar exceção manualmente
try {
  // código
} catch (error) {
  captureException(error, { userId: '123' });
}

// Capturar mensagem
captureMessage('Operação importante realizada', 'info');

// Definir usuário no contexto
setUser({ id: '123', username: 'john' });

// Adicionar breadcrumb (rastro de eventos)
addBreadcrumb('User clicked button', 'ui', { buttonId: 'submit' });
```

---

## Logs Estruturados

### Log Estruturado Customizado

```typescript
this.logger.logStructured('info', 'Operação realizada', {
  userId: '123',
  operation: 'update_profile',
  duration: 150,
  success: true,
});
```

### Log de Performance

```typescript
const startTime = Date.now();

// ... sua operação ...

this.logger.logPerformance('processPayment', Date.now() - startTime, {
  paymentId: '456',
  amount: 100.50,
});
```

**Alerta automático**: Se a operação demorar mais de 5 segundos, um aviso é gerado.

### Log de Requisição HTTP

```typescript
this.logger.logHttpRequest('POST', '/api/users', 201, 150, {
  userId: '123',
  ip: '192.168.1.1',
});
```

### Log de Erro de Banco de Dados

```typescript
try {
  await this.prisma.user.create(data);
} catch (error) {
  this.logger.logDatabaseError('createUser', error, {
    data,
    table: 'users',
  });
  throw error;
}
```

---

## Performance Monitoring

### Rastreamento Automático

O sistema detecta automaticamente operações lentas:

```typescript
// Se demorar mais de 5 segundos, um aviso é gerado
this.logger.logPerformance('heavyOperation', 6000);
// Output: WARN Slow operation detected: heavyOperation took 6000ms
```

### Transações do Sentry

Para rastreamento detalhado de performance:

```typescript
import { startTransaction } from '@infra/logger';

const transaction = startTransaction('processOrder', 'task');

try {
  // Sua operação
  await this.processOrder(orderId);
  
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

---

## Boas Práticas

### 1. Sempre defina o contexto

```typescript
constructor(private readonly logger: AdvancedLoggerService) {
  this.logger.setContext('NomeDoSeuService');
}
```

### 2. Use o nível apropriado

- `log()` → Operações importantes
- `error()` → Erros (enviado para Sentry)
- `warn()` → Avisos
- `debug()` → Desenvolvimento
- `verbose()` → Informações detalhadas

### 3. Não logue informações sensíveis

❌ **Nunca logue:**
- Senhas
- Tokens de autenticação
- Chaves de API
- Dados de cartão de crédito
- Informações pessoais sensíveis (CPF, RG, etc.)

### 4. Use mensagens descritivas

```typescript
// ❌ Ruim
this.logger.log('Done');

// ✅ Bom
this.logger.log(`Usuário ${user.id} criado com sucesso`);
```

### 5. Logue erros com stack trace

```typescript
try {
  // código
} catch (error) {
  this.logger.error('Descrição do erro', error.stack);
  throw error;
}
```

### 6. Use logs estruturados para análise

```typescript
// ✅ Facilita busca e análise
this.logger.logStructured('info', 'Pagamento processado', {
  paymentId: '123',
  amount: 100.50,
  method: 'credit_card',
  status: 'approved',
});
```

### 7. Monitore performance de operações críticas

```typescript
const startTime = Date.now();

await this.criticalOperation();

this.logger.logPerformance('criticalOperation', Date.now() - startTime);
```

---

## Estrutura de Arquivos

```
src/infra/logger/
├── logger.service.ts              # Logger básico (console colorido)
├── advanced-logger.service.ts     # Logger avançado (Winston + Sentry)
├── logging.interceptor.ts         # Interceptor HTTP
├── logger.module.ts               # Módulo do logger (Global)
├── winston.config.ts              # Configuração do Winston
├── sentry.config.ts               # Configuração do Sentry
└── index.ts                       # Exportações
```

---

## Exemplos Práticos

### Exemplo 1: Service com Logs Completos

```typescript
import { Injectable } from '@nestjs/common';
import { AdvancedLoggerService } from '@infra/logger';

@Injectable()
export class OrderService {
  constructor(private readonly logger: AdvancedLoggerService) {
    this.logger.setContext('OrderService');
  }

  async processOrder(orderId: string) {
    const startTime = Date.now();
    
    this.logger.log(`Processando pedido: ${orderId}`);

    try {
      // Busca o pedido
      const order = await this.findOrder(orderId);
      this.logger.debug('Pedido encontrado:', order);

      // Processa pagamento
      const payment = await this.processPayment(order);
      this.logger.log(`Pagamento processado: ${payment.id}`);

      // Atualiza estoque
      await this.updateInventory(order.items);
      this.logger.log('Estoque atualizado');

      // Log de performance
      this.logger.logPerformance(
        'processOrder',
        Date.now() - startTime,
        { orderId, paymentId: payment.id }
      );

      return { success: true, orderId, paymentId: payment.id };
    } catch (error) {
      this.logger.error(
        `Erro ao processar pedido ${orderId}`,
        error.stack
      );
      throw error;
    }
  }
}
```

### Exemplo 2: Controller com Logs HTTP

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AdvancedLoggerService } from '@infra/logger';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly logger: AdvancedLoggerService,
  ) {
    this.logger.setContext('OrderController');
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    this.logger.log('Nova requisição de criação de pedido');
    
    try {
      const order = await this.orderService.create(createOrderDto);
      
      this.logger.logStructured('info', 'Pedido criado', {
        orderId: order.id,
        userId: createOrderDto.userId,
        total: order.total,
      });

      return order;
    } catch (error) {
      this.logger.error('Erro ao criar pedido', error.stack);
      throw error;
    }
  }
}
```

### Exemplo 3: Tratamento de Erro de Banco de Dados

```typescript
async createUser(data: CreateUserDto) {
  try {
    const user = await this.prisma.user.create({ data });
    this.logger.log(`Usuário criado: ${user.id}`);
    return user;
  } catch (error) {
    // Log especializado para erros de banco
    this.logger.logDatabaseError('createUser', error, {
      email: data.email,
      table: 'users',
      operation: 'create',
    });
    
    throw new InternalServerErrorException('Erro ao criar usuário');
  }
}
```

---

## Monitoramento em Produção

### Dashboard do Sentry

Acesse [sentry.io](https://sentry.io/) para visualizar:

- **Erros em tempo real**
- **Stack traces completos**
- **Frequência de erros**
- **Usuários afetados**
- **Performance de transações**
- **Breadcrumbs (rastro de eventos)**

### Análise de Logs

Use ferramentas como:

- **Elasticsearch + Kibana** - Para análise avançada
- **Grafana + Loki** - Para visualização
- **CloudWatch** (AWS) - Se hospedado na AWS
- **Google Cloud Logging** - Se hospedado no GCP

### Alertas

Configure alertas no Sentry para:

- Erros críticos
- Aumento súbito de erros
- Operações lentas
- Erros de segurança

---

## Troubleshooting

### Logs não estão sendo salvos em arquivo

1. Verifique se a pasta `logs/` existe (é criada automaticamente)
2. Verifique permissões de escrita
3. Verifique se `NODE_ENV !== 'test'`

### Sentry não está recebendo erros

1. Verifique se `SENTRY_DSN` está configurado
2. Verifique a conexão com a internet
3. Verifique se o DSN está correto
4. Verifique os logs do console para mensagens de erro

### Logs muito verbosos

1. Ajuste `LOG_LEVEL` no `.env`:
   - `error` - Apenas erros
   - `warn` - Avisos e erros
   - `info` - Informações, avisos e erros (padrão)
   - `debug` - Tudo, incluindo debug
   - `verbose` - Tudo, incluindo verbose

2. Em produção, use `LOG_LEVEL=warn` ou `LOG_LEVEL=error`

---

## Migração do Logger Antigo

Se você estava usando o `CustomLoggerService`, pode migrar gradualmente:

```typescript
// Antes
import { CustomLoggerService } from '@infra/logger';

// Depois (com todas as funcionalidades)
import { AdvancedLoggerService } from '@infra/logger';

// A API é compatível, então não precisa mudar o código!
```

---

## Suporte

Para dúvidas ou problemas:

1. Consulte a documentação do [Winston](https://github.com/winstonjs/winston)
2. Consulte a documentação do [Sentry](https://docs.sentry.io/)
3. Abra uma issue no repositório do projeto
