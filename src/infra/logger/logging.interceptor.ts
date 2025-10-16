// import {
//   CallHandler,
//   ExecutionContext,
//   Injectable,
//   NestInterceptor,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { tap } from 'rxjs/operators';
// import { AdvancedLoggerService } from './advanced-logger.service';

// @Injectable()
// export class LoggingInterceptor implements NestInterceptor {
//   constructor(private readonly logger: AdvancedLoggerService) {
//     this.logger.setContext('HTTP');
//   }

//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     if (process.env.NODE_ENV !== 'development') {
//       return next.handle();
//     }

//     const request = context.switchToHttp().getRequest();
//     const { method, url, body, query, params } = request;
//     const userAgent = request.get('user-agent') || '';
//     const ip = request.ip;

//     const now = Date.now();

//     this.logger.log(
//       `Incoming Request: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
//     );

//     if (Object.keys(body || {}).length > 0) {
//       this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
//     }

//     if (Object.keys(query || {}).length > 0) {
//       this.logger.debug(`Query Params: ${JSON.stringify(query)}`);
//     }

//     if (Object.keys(params || {}).length > 0) {
//       this.logger.debug(`Route Params: ${JSON.stringify(params)}`);
//     }

//     return next.handle().pipe(
//       tap({
//         next: (data) => {
//           const response = context.switchToHttp().getResponse();
//           const { statusCode } = response;
//           const responseTime = Date.now() - now;

//           // Usa o método especializado para logs HTTP
//           this.logger.logHttpRequest(method, url, statusCode, responseTime, {
//             ip,
//             userAgent,
//           });

//           if (process.env.NODE_ENV !== 'prod') {
//             this.logger.debug(`Response Data: ${JSON.stringify(data)}`);
//           }
//         },
//         error: (error) => {
//           const responseTime = Date.now() - now;
//           this.logger.error(
//             `Error: ${method} ${url} - ${error.message} - ${responseTime}ms`,
//             error.stack,
//           );
//         },
//       }),
//     );
//   }
// }
