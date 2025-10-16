// import { Injectable } from '@nestjs/common';
// import { CustomLoggerService } from '@infra/logger';

// /**
//  * Exemplo de uso do sistema de logs
//  * Este arquivo demonstra as diferentes formas de usar o logger
//  */

// @Injectable()
// export class ExampleService {
//   constructor(private readonly logger: CustomLoggerService) {
//     // IMPORTANTE: Sempre defina o contexto no construtor
//     this.logger.setContext('ExampleService');
//   }

//   // Exemplo 1: Log simples
//   simpleLog() {
//     this.logger.log('Esta é uma mensagem de log simples');
//   }

//   // Exemplo 2: Log com informações dinâmicas
//   logWithData(userId: string) {
//     this.logger.log(`Usuário ${userId} realizou uma ação`);
//   }

//   // Exemplo 3: Debug (só aparece em desenvolvimento)
//   debugExample(data: any) {
//     this.logger.debug(`Dados recebidos: ${JSON.stringify(data)}`);
//     this.logger.debug(`Processando ${data.items?.length || 0} itens`);
//   }

//   // Exemplo 4: Warning
//   warningExample() {
//     this.logger.warn('Atenção: Esta operação está próxima do limite');
//   }

//   // Exemplo 5: Error com stack trace
//   errorExample() {
//     try {
//       // Simula um erro
//       throw new Error('Algo deu errado!');
//     } catch (error) {
//       this.logger.error('Erro ao processar operação', error.stack);
//       throw error;
//     }
//   }

//   // Exemplo 6: Verbose (informações muito detalhadas)
//   verboseExample(request: any) {
//     this.logger.verbose(`Detalhes completos da requisição: ${JSON.stringify(request)}`);
//   }

//   // Exemplo 7: Operação completa com múltiplos logs
//   async completeOperation(data: any) {
//     this.logger.log('Iniciando operação completa');
//     this.logger.debug(`Dados de entrada: ${JSON.stringify(data)}`);

//     try {
//       // Simula processamento
//       this.logger.log('Validando dados...');
//       await this.validateData(data);

//       this.logger.log('Processando dados...');
//       const result = await this.processData(data);

//       this.logger.log('Salvando resultado...');
//       await this.saveResult(result);

//       this.logger.log('Operação concluída com sucesso');
//       return result;
//     } catch (error) {
//       this.logger.error('Erro na operação completa', error.stack);
//       throw error;
//     }
//   }

//   private async validateData(data: any) {
//     this.logger.debug('Validando dados...');
//     // Lógica de validação
//   }

//   private async processData(data: any) {
//     this.logger.debug('Processando dados...');
//     // Lógica de processamento
//     return { processed: true, data };
//   }

//   private async saveResult(result: any) {
//     this.logger.debug('Salvando resultado...');
//     // Lógica de salvamento
//   }

//   // Exemplo 8: Log de objetos complexos
//   logComplexObject() {
//     const complexObject = {
//       id: 1,
//       name: 'Exemplo',
//       nested: {
//         value: 'teste',
//         array: [1, 2, 3],
//       },
//     };

//     // O logger formata automaticamente objetos JSON
//     this.logger.log(complexObject);
//     // Ou com mensagem descritiva
//     this.logger.log(`Objeto complexo: ${JSON.stringify(complexObject)}`);
//   }

//   // Exemplo 9: Log condicional
//   conditionalLog(condition: boolean) {
//     if (condition) {
//       this.logger.log('Condição verdadeira');
//     } else {
//       this.logger.warn('Condição falsa - verificar');
//     }
//   }

//   // Exemplo 10: Log de performance
//   async performanceLog() {
//     const start = Date.now();

//     // Operação que queremos medir
//     await this.someOperation();

//     const duration = Date.now() - start;
//     this.logger.log(`Operação concluída em ${duration}ms`);

//     if (duration > 1000) {
//       this.logger.warn(`Operação lenta detectada: ${duration}ms`);
//     }
//   }

//   private async someOperation() {
//     // Simula operação
//     return new Promise((resolve) => setTimeout(resolve, 100));
//   }
// }
