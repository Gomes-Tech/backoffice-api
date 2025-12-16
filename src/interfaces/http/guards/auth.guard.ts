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
    const request = context.switchToHttp().getRequest();
    const endpoint = request.url;

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (process.env.NODE_ENV === 'dev') {
      console.log('[AuthDispatchGuard] Endpoint:', endpoint);
      console.log('[AuthDispatchGuard] É público?', isPublic);
    }

    if (isPublic) {
      if (process.env.NODE_ENV === 'dev') {
        console.log(
          '[AuthDispatchGuard] ✅ Endpoint público, permitindo acesso',
        );
      }
      return true;
    }

    if (request.method === 'OPTIONS') {
      return true;
    }

    // Verifica API key (pode lançar exceção se não tiver)
    try {
      this.apiKeyAuth.canActivate(context);
    } catch (error) {
      if (process.env.NODE_ENV === 'dev') {
        console.log(
          '[AuthDispatchGuard] ❌ Erro na verificação de API key:',
          (error as Error)?.message,
        );
      }
      throw error;
    }

    const types = this.reflector.getAllAndOverride<string[]>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (process.env.NODE_ENV === 'dev') {
      console.log('[AuthDispatchGuard] Tipos de autenticação:', types);
    }

    if (!types || types.length === 0) {
      if (process.env.NODE_ENV === 'dev') {
        console.log(
          '[AuthDispatchGuard] ✅ Nenhum tipo especificado, permitindo acesso',
        );
      }
      return true;
    }

    if (types.includes('customer')) {
      if (process.env.NODE_ENV === 'dev') {
        console.log('[AuthDispatchGuard] Chamando CustomerAuthGuard...');
      }
      return this.customerAuth.canActivate(context) as Promise<boolean>;
    }

    // checa se "user" está na lista
    if (types.includes('user')) {
      if (process.env.NODE_ENV === 'dev') {
        console.log('[AuthDispatchGuard] Chamando AuthGuard (user)...');
      }
      return this.userAuth.canActivate(context) as Promise<boolean>;
    }

    // if (types.includes('api')) {
    //   return this.apiKeyAuth.canActivate(context);
    // }

    if (process.env.NODE_ENV === 'dev') {
      console.log(
        '[AuthDispatchGuard] ❌ Tipo de autenticação não especificado',
      );
    }
    throw new UnauthorizedException('Auth type not specified');
  }
}
