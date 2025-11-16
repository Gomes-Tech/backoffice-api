import { Public } from '@interfaces/http';
import { Controller, Get, Request } from '@nestjs/common';
import { RequestId } from '@shared/decorators';
import { REQUEST_ID_KEY } from '@shared/interceptors';
import { AppService } from './app.service';

@Controller()
@Public()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('request-id-demo')
  getRequestIdDemo(
    @RequestId() requestId: string,
    @Request() req: Request,
  ) {
    // Duas formas de acessar o Request ID:
    // 1. Usando o decorator @RequestId()
    // 2. Diretamente do objeto Request
    const requestIdFromRequest = (req as any)[REQUEST_ID_KEY];

    return {
      message: 'Request ID Demo',
      requestIdFromDecorator: requestId,
      requestIdFromRequest: requestIdFromRequest,
      areTheyEqual: requestId === requestIdFromRequest,
      note: 'Verifique o header X-Request-ID na resposta HTTP',
    };
  }
}
