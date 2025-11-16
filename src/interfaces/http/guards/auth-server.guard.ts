import { UnauthorizedException } from '@infra/filters';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { secureCompare } from '@shared/utils';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthServerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const { headers } = context.switchToHttp().getRequest();
    const { api_key: apiKey } = headers;

    const serverApiKey = process.env.SERVER_AUTH_SECRET;

    // Usar comparação segura contra timing attacks
    if (!apiKey || !serverApiKey || !secureCompare(apiKey, serverApiKey)) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}
