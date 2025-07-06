import { CreateToken, TokenPassword } from '../entities';

export abstract class TokenPasswordRepository {
  abstract verifyToken(email: string): Promise<TokenPassword[]>;
  abstract createToken(dto: CreateToken): Promise<void>;
  abstract updateToken(email: string): Promise<void>;
}
