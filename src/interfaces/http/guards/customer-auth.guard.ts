import { UnauthorizedException } from '@infra/filters';
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

    if (!token) {
      throw new UnauthorizedException('Token de cliente não encontrado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      request['customer'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    return request.cookies?.['accessToken']; // nome do cookie que você setou
  }
}
