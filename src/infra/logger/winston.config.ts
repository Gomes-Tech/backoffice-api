// import * as winston from 'winston';
// import * as DailyRotateFile from 'winston-daily-rotate-file';
// import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

// /**
//  * Configuração do Winston Logger
//  * Suporta logs em arquivo com rotação diária
//  */

// // Formato customizado para logs
// const customFormat = winston.format.combine(
//   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//   winston.format.errors({ stack: true }),
//   winston.format.splat(),
//   winston.format.json(),
// );

// // Formato para console (colorido e legível)
// const consoleFormat = winston.format.combine(
//   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//   winston.format.ms(),
//   nestWinstonModuleUtilities.format.nestLike('BackofficeAPI', {
//     colors: true,
//     prettyPrint: true,
//   }),
// );

// // Transport para logs de erro (rotação diária)
// const errorFileTransport: DailyRotateFile = new DailyRotateFile({
//   filename: 'logs/error-%DATE%.log',
//   datePattern: 'YYYY-MM-DD',
//   zippedArchive: true, // Compacta logs antigos
//   maxSize: '20m', // Tamanho máximo de cada arquivo
//   maxFiles: '14d', // Mantém logs por 14 dias
//   level: 'error',
//   format: customFormat,
// });

// // Transport para logs combinados (rotação diária)
// const combinedFileTransport: DailyRotateFile = new DailyRotateFile({
//   filename: 'logs/combined-%DATE%.log',
//   datePattern: 'YYYY-MM-DD',
//   zippedArchive: true,
//   maxSize: '20m',
//   maxFiles: '30d', // Mantém logs por 30 dias
//   format: customFormat,
// });

// // Transport para logs de aplicação (rotação diária)
// const appFileTransport: DailyRotateFile = new DailyRotateFile({
//   filename: 'logs/app-%DATE%.log',
//   datePattern: 'YYYY-MM-DD',
//   zippedArchive: true,
//   maxSize: '20m',
//   maxFiles: '7d', // Mantém logs por 7 dias
//   level: 'info',
//   format: customFormat,
// });

// // Configuração dos transports
// const transports: winston.transport[] = [
//   // Console (sempre ativo)
//   new winston.transports.Console({
//     format: consoleFormat,
//   }),
// ];

// // Adiciona transports de arquivo apenas se não estiver em teste
// if (process.env.NODE_ENV !== 'test') {
//   transports.push(errorFileTransport);
//   transports.push(combinedFileTransport);
//   transports.push(appFileTransport);
// }

// // Configuração do Winston
// export const winstonConfig = {
//   level: process.env.LOG_LEVEL || 'info',
//   format: customFormat,
//   transports,
//   exitOnError: false,
//   // Tratamento de exceções não capturadas
//   exceptionHandlers: [
//     new winston.transports.File({
//       filename: 'logs/exceptions.log',
//       format: customFormat,
//     }),
//   ],
//   // Tratamento de rejeições de promises não capturadas
//   rejectionHandlers: [
//     new winston.transports.File({
//       filename: 'logs/rejections.log',
//       format: customFormat,
//     }),
//   ],
// };

// // Cria a instância do Winston Logger
// export const winstonLogger = winston.createLogger(winstonConfig);

// // Eventos de rotação de logs
// errorFileTransport.on('rotate', (oldFilename, newFilename) => {
//   winstonLogger.info('Log file rotated', { oldFilename, newFilename });
// });

// combinedFileTransport.on('rotate', (oldFilename, newFilename) => {
//   winstonLogger.info('Log file rotated', { oldFilename, newFilename });
// });

// appFileTransport.on('rotate', (oldFilename, newFilename) => {
//   winstonLogger.info('Log file rotated', { oldFilename, newFilename });
// });
