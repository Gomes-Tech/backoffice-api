export class Customer {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public password: string,
  ) {}
}

export class ReturnCustomer {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
  ) {}
}

export class CreateUser extends Customer {
  constructor(id: string, name: string, email: string, password: string) {
    super(id, name, email, password);
  }
}

export class UpdateUser {
  constructor(
    public name?: string,
    public email?: string,
    public password?: string,
  ) {}
}
