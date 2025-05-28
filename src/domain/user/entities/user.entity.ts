export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public password: string,
    public role: string,
    public isActive: boolean = true,
    public photo?: string | null,
  ) {}
}
