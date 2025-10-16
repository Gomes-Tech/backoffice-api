// import { Injectable, LoggerService, Scope } from '@nestjs/common';

// @Injectable({ scope: Scope.TRANSIENT })
// export class CustomLoggerService implements LoggerService {
//   private context?: string;

//   setContext(context: string) {
//     this.context = context;
//   }

//   log(message: any, context?: string) {
//     const logContext = context || this.context || 'Application';
//     const timestamp = new Date().toISOString();
//     console.log(
//       `\x1b[32m[${timestamp}]\x1b[0m \x1b[36m[${logContext}]\x1b[0m \x1b[32mLOG\x1b[0m ${this.formatMessage(message)}`,
//     );
//   }

//   error(message: any, trace?: string, context?: string) {
//     const logContext = context || this.context || 'Application';
//     const timestamp = new Date().toISOString();
//     console.error(
//       `\x1b[31m[${timestamp}]\x1b[0m \x1b[36m[${logContext}]\x1b[0m \x1b[31mERROR\x1b[0m ${this.formatMessage(message)}`,
//     );
//     if (trace) {
//       console.error(`\x1b[31mTrace:\x1b[0m ${trace}`);
//     }
//   }

//   warn(message: any, context?: string) {
//     const logContext = context || this.context || 'Application';
//     const timestamp = new Date().toISOString();
//     console.warn(
//       `\x1b[33m[${timestamp}]\x1b[0m \x1b[36m[${logContext}]\x1b[0m \x1b[33mWARN\x1b[0m ${this.formatMessage(message)}`,
//     );
//   }

//   debug(message: any, context?: string) {
//     if (process.env.NODE_ENV === 'prod') return;
    
//     const logContext = context || this.context || 'Application';
//     const timestamp = new Date().toISOString();
//     console.debug(
//       `\x1b[35m[${timestamp}]\x1b[0m \x1b[36m[${logContext}]\x1b[0m \x1b[35mDEBUG\x1b[0m ${this.formatMessage(message)}`,
//     );
//   }

//   verbose(message: any, context?: string) {
//     if (process.env.NODE_ENV === 'prod') return;
    
//     const logContext = context || this.context || 'Application';
//     const timestamp = new Date().toISOString();
//     console.log(
//       `\x1b[37m[${timestamp}]\x1b[0m \x1b[36m[${logContext}]\x1b[0m \x1b[37mVERBOSE\x1b[0m ${this.formatMessage(message)}`,
//     );
//   }

//   private formatMessage(message: any): string {
//     if (typeof message === 'object') {
//       return JSON.stringify(message, null, 2);
//     }
//     return String(message);
//   }
// }
