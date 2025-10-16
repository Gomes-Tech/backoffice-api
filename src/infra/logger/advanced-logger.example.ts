// import { Injectable } from '@nestjs/common';
// import { AdvancedLoggerService } from '@infra/logger';

// /**
//  * Exemplos práticos de uso do sistema de logs avançado
//  * Demonstra todas as funcionalidades disponíveis
//  */

// @Injectable()
// export class AdvancedLoggerExampleService {
//   constructor(private readonly logger: AdvancedLoggerService) {
//     // IMPORTANTE: Sempre defina o contexto no construtor
//     this.logger.setContext('AdvancedLoggerExample');
//   }

//   // ============================================
//   // EXEMPLO 1: Logs Básicos
//   // ============================================
//   basicLogging() {
//     this.logger.log('Esta é uma mensagem de log simples');
//     this.logger.error('Este é um erro', 'Stack trace aqui');
//     this.logger.warn('Este é um aviso');
//     this.logger.debug('Esta é uma mensagem de debug');
//     this.logger.verbose('Esta é uma mensagem verbose');
//   }

//   // ============================================
//   // EXEMPLO 2: Log Estruturado
//   // ============================================
//   structuredLogging() {
//     this.logger.logStructured('info', 'Usuário realizou login', {
//       userId: '123',
//       email: 'user@example.com',
//       ip: '192.168.1.1',
//       userAgent: 'Mozilla/5.0...',
//       timestamp: new Date().toISOString(),
//     });

//     this.logger.logStructured('warn', 'Tentativa de acesso negada', {
//       userId: '456',
//       resource: '/admin/users',
//       reason: 'insufficient_permissions',
//     });
//   }

//   // ============================================
//   // EXEMPLO 3: Log de Performance
//   // ============================================
//   async performanceLogging() {
//     const startTime = Date.now();

//     // Simula uma operação
//     await this.heavyOperation();

//     // Log automático de performance
//     this.logger.logPerformance('heavyOperation', Date.now() - startTime, {
//       recordsProcessed: 1000,
//       cacheHit: true,
//     });
//   }

//   // ============================================
//   // EXEMPLO 4: Log de Requisição HTTP
//   // ============================================
//   httpRequestLogging() {
//     this.logger.logHttpRequest('POST', '/api/users', 201, 150, {
//       userId: '123',
//       ip: '192.168.1.1',
//       userAgent: 'PostmanRuntime/7.26.8',
//     });

//     this.logger.logHttpRequest('GET', '/api/products', 200, 45, {
//       query: { page: 1, limit: 10 },
//       resultsCount: 10,
//     });
//   }

//   // ============================================
//   // EXEMPLO 5: Log de Erro de Banco de Dados
//   // ============================================
//   async databaseErrorLogging() {
//     try {
//       // Simula um erro de banco de dados
//       throw new Error('Unique constraint violation');
//     } catch (error) {
//       this.logger.logDatabaseError('createUser', error as Error, {
//         table: 'users',
//         operation: 'INSERT',
//         data: { email: 'user@example.com' },
//       });
//     }
//   }

//   // ============================================
//   // EXEMPLO 6: Operação Completa com Logs
//   // ============================================
//   async completeOperationExample(userId: string, productId: string) {
//     const startTime = Date.now();

//     this.logger.log(`Iniciando processamento de pedido para usuário ${userId}`);

//     try {
//       // Passo 1: Buscar usuário
//       this.logger.debug(`Buscando usuário: ${userId}`);
//       const user = await this.findUser(userId);
//       this.logger.log(`Usuário encontrado: ${user.name}`);

//       // Passo 2: Buscar produto
//       this.logger.debug(`Buscando produto: ${productId}`);
//       const product = await this.findProduct(productId);
//       this.logger.log(`Produto encontrado: ${product.name}`);

//       // Passo 3: Verificar estoque
//       if (product.stock < 1) {
//         this.logger.warn(`Produto ${productId} sem estoque`);
//         throw new Error('Produto sem estoque');
//       }

//       // Passo 4: Processar pagamento
//       this.logger.log('Processando pagamento...');
//       const payment = await this.processPayment(user, product);
//       this.logger.log(`Pagamento processado: ${payment.id}`);

//       // Passo 5: Criar pedido
//       const order = await this.createOrder(user, product, payment);
//       this.logger.log(`Pedido criado: ${order.id}`);

//       // Log estruturado do resultado
//       this.logger.logStructured('info', 'Pedido processado com sucesso', {
//         orderId: order.id,
//         userId: user.id,
//         productId: product.id,
//         paymentId: payment.id,
//         amount: product.price,
//         duration: Date.now() - startTime,
//       });

//       // Log de performance
//       this.logger.logPerformance('processOrder', Date.now() - startTime, {
//         orderId: order.id,
//         steps: 5,
//       });

//       return order;
//     } catch (error) {
//       // Log de erro com contexto completo
//       this.logger.error(
//         `Erro ao processar pedido para usuário ${userId}`,
//         (error as Error).stack,
//       );

//       // Log estruturado do erro
//       this.logger.logStructured('error', 'Falha no processamento do pedido', {
//         userId,
//         productId,
//         error: (error as Error).message,
//         duration: Date.now() - startTime,
//       });

//       throw error;
//     }
//   }

//   // ============================================
//   // EXEMPLO 7: Logs de Segurança
//   // ============================================
//   securityLogging() {
//     // Aviso crítico (será enviado para o Sentry)
//     this.logger.warn('Tentativa de SQL injection detectada', 'SecurityAlert');

//     // Log estruturado de evento de segurança
//     this.logger.logStructured('warn', 'Tentativa de acesso não autorizado', {
//       userId: '789',
//       resource: '/admin/settings',
//       ip: '192.168.1.100',
//       reason: 'invalid_token',
//       severity: 'high',
//     });

//     // Erro de autenticação
//     this.logger.error('Falha na autenticação: token inválido', undefined, 'Auth');
//   }

//   // ============================================
//   // EXEMPLO 8: Logs de Auditoria
//   // ============================================
//   auditLogging() {
//     this.logger.logStructured('info', 'Registro de auditoria', {
//       action: 'UPDATE',
//       resource: 'users',
//       resourceId: '123',
//       userId: '456',
//       changes: {
//         before: { name: 'João Silva', email: 'joao@example.com' },
//         after: { name: 'João Silva Santos', email: 'joao.santos@example.com' },
//       },
//       timestamp: new Date().toISOString(),
//     });
//   }

//   // ============================================
//   // EXEMPLO 9: Logs de Integração Externa
//   // ============================================
//   async externalIntegrationLogging() {
//     const startTime = Date.now();

//     this.logger.log('Iniciando integração com API externa');

//     try {
//       const response = await this.callExternalAPI();

//       this.logger.logStructured('info', 'Integração externa bem-sucedida', {
//         api: 'payment-gateway',
//         endpoint: '/v1/payments',
//         statusCode: response.status,
//         duration: Date.now() - startTime,
//       });
//     } catch (error) {
//       this.logger.logStructured('error', 'Falha na integração externa', {
//         api: 'payment-gateway',
//         endpoint: '/v1/payments',
//         error: (error as Error).message,
//         duration: Date.now() - startTime,
//       });

//       throw error;
//     }
//   }

//   // ============================================
//   // EXEMPLO 10: Logs de Cache
//   // ============================================
//   cacheLogging(key: string, hit: boolean) {
//     if (hit) {
//       this.logger.debug(`Cache HIT: ${key}`);
//       this.logger.logStructured('debug', 'Cache hit', {
//         key,
//         operation: 'get',
//       });
//     } else {
//       this.logger.debug(`Cache MISS: ${key}`);
//       this.logger.logStructured('debug', 'Cache miss', {
//         key,
//         operation: 'get',
//       });
//     }
//   }

//   // ============================================
//   // Métodos auxiliares (simulação)
//   // ============================================
//   private async heavyOperation(): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, 100));
//   }

//   private async findUser(userId: string) {
//     return { id: userId, name: 'João Silva', email: 'joao@example.com' };
//   }

//   private async findProduct(productId: string) {
//     return { id: productId, name: 'Produto Exemplo', price: 100, stock: 10 };
//   }

//   private async processPayment(user: any, product: any) {
//     return { id: 'pay_123', amount: product.price, status: 'approved' };
//   }

//   private async createOrder(user: any, product: any, payment: any) {
//     return { id: 'order_123', userId: user.id, productId: product.id, paymentId: payment.id };
//   }

//   private async callExternalAPI() {
//     return { status: 200, data: {} };
//   }
// }
