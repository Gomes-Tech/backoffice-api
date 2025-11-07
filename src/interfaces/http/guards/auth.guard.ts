// auth-dispatch.guard.ts
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_TYPE_KEY } from '../decorators/auth.decorator';
import { AuthServerGuard } from './auth-server.guard';
import { CustomerAuthGuard } from './customer-auth.guard';
import { AuthGuard } from './user-auth.guard';

@Injectable()
export class AuthDispatchGuard {
  constructor(
    private reflector: Reflector,
    private customerAuth: CustomerAuthGuard,
    private userAuth: AuthGuard,
    private apiKeyAuth: AuthServerGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const types = this.reflector.getAllAndOverride<string[]>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!types || types.length === 0) return true;

    if (types.includes('customer')) {
      return this.customerAuth.canActivate(context) as Promise<boolean>;
    }

    // checa se "user" está na lista
    if (types.includes('user')) {
      return this.userAuth.canActivate(context) as Promise<boolean>;
    }

    if (types.includes('api')) {
      return this.apiKeyAuth.canActivate(context);
    }

    throw new UnauthorizedException('Auth type not specified');
  }
}
