import { compare, hash } from 'bcrypt';

export class CryptographyService {
  private readonly salt = 12;

  async hash(plaintext: string): Promise<string> {
    return hash(plaintext, this.salt);
  }

  async compare(plaintext: string, hash: string): Promise<boolean> {
    return compare(plaintext, hash);
  }
}
