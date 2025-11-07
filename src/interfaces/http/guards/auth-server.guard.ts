import { UnauthorizedException } from '@infra/filters';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthServerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { headers } = context.switchToHttp().getRequest();
    const { api_key: apiKey } = headers;

    const serverApiKey = process.env.SERVER_AUTH_SECRET;

    if (!apiKey || apiKey !== serverApiKey) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}
