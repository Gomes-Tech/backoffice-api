import { TokenExpiredException, UnauthorizedException } from '@infra/filters';
import { SecurityLoggerService, TokenBlacklistService } from '@infra/security';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CLIENT_JWT } from '../modules/jwt.module';

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(
    @Inject(CLIENT_JWT)
    private jwtService: JwtService,
    private reflector: Reflector,
    private securityLogger: SecurityLoggerService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const userAgent = request.get('user-agent') || 'unknown';
    const endpoint = request.url;
    const method = request.method;

    // Log de debug para entender o problema
    if (process.env.NODE_ENV === 'dev') {
      console.log('[CustomerAuthGuard] Endpoint:', endpoint);
      console.log('[CustomerAuthGuard] Token encontrado:', !!token);
      if (token) {
        console.log(
          '[CustomerAuthGuard] Token (primeiros 20 chars):',
          token.substring(0, 20) + '...',
        );
      }
    }

    if (!token) {
      this.securityLogger.logUnauthorizedAccess(
        endpoint,
        method,
        ip,
        undefined,
        userAgent,
      );
      throw new UnauthorizedException('Token de cliente não encontrado');
    }

    try {
      if (process.env.NODE_ENV === 'dev') {
        console.log('[CustomerAuthGuard] Verificando token...');
      }

      const payload = await this.jwtService.verifyAsync(token);

      if (process.env.NODE_ENV === 'dev') {
        console.log('[CustomerAuthGuard] Token verificado com sucesso!');
        console.log('[CustomerAuthGuard] Payload ID:', payload.id);
        console.log('[CustomerAuthGuard] Payload JTI:', payload.jti);
      }

      // Verifica se o token está na blacklist
      if (payload.jti) {
        if (process.env.NODE_ENV === 'dev') {
          console.log('[CustomerAuthGuard] Verificando blacklist...');
        }

        const isBlacklisted =
          await this.tokenBlacklistService.isTokenBlacklisted(payload.jti);

        if (process.env.NODE_ENV === 'dev') {
          console.log('[CustomerAuthGuard] Token na blacklist?', isBlacklisted);
        }

        if (isBlacklisted) {
          this.securityLogger.logInvalidToken(
            ip,
            endpoint,
            userAgent,
            'Token foi revogado (blacklist)',
          );
          throw new UnauthorizedException('Token foi revogado!');
        }
      }

      request['customer'] = payload;

      if (process.env.NODE_ENV === 'dev') {
        console.log(
          '[CustomerAuthGuard] ✅ Autenticação bem-sucedida! Retornando true',
        );
      }

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'dev') {
        console.log('[CustomerAuthGuard] ❌ Erro na verificação do token');
        console.log(
          '[CustomerAuthGuard] Tipo do erro:',
          error?.constructor?.name,
        );
        console.log(
          '[CustomerAuthGuard] Nome do erro:',
          (error as Error)?.name,
        );
        console.log(
          '[CustomerAuthGuard] Mensagem do erro:',
          (error as Error)?.message,
        );
        console.log('[CustomerAuthGuard] Stack:', (error as Error)?.stack);
      }

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Detecta se o token expirou
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        this.securityLogger.logInvalidToken(
          ip,
          endpoint,
          userAgent,
          'Token expirado',
        );
        throw new TokenExpiredException('Token expirado');
      }

      this.securityLogger.logInvalidToken(
        ip,
        endpoint,
        userAgent,
        error instanceof Error ? error.message : 'Token inválido ou expirado',
      );
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
