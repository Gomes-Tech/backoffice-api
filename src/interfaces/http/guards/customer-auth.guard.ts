import { UnauthorizedException } from '@infra/filters';
import {
  SecurityLoggerService,
  TokenBlacklistService,
} from '@infra/security';
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
      const payload = await this.jwtService.verifyAsync(token);

      // Verifica se o token está na blacklist
      if (payload.jti) {
        const isBlacklisted =
          await this.tokenBlacklistService.isTokenBlacklisted(payload.jti);
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
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
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
    return request.cookies?.['accessToken']; // nome do cookie que você setou
  }
}
