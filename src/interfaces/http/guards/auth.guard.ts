// auth-dispatch.guard.ts
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_TYPE_KEY } from '../decorators/auth.decorator';
import { CustomerAuthGuard } from './customer-auth.guard';
import { AuthGuard } from './user-auth.guard';

@Injectable()
export class AuthDispatchGuard {
  constructor(
    private reflector: Reflector,
    private customerAuth: CustomerAuthGuard,
    private userAuth: AuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const type = this.reflector.getAllAndOverride<string>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (type === 'customer') {
      return this.customerAuth.canActivate(context) as Promise<boolean>;
    }

    if (type === 'user') {
      return this.userAuth.canActivate(context) as Promise<boolean>;
    }

    throw new UnauthorizedException('Auth type not specified');
  }
}
