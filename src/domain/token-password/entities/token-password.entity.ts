export class TokenPassword {
  constructor(
    public readonly id: string,
    public token: string,
    public email: string,
    public expiresAt: Date,
    public used?: boolean,
  ) {}
}

export class CreateToken extends TokenPassword {
  constructor(id: string, token: string, email: string, expiresAt: Date) {
    super(id, token, email, expiresAt);
  }
}

export class UpdateToken {
  constructor(public used: boolean) {}
}
