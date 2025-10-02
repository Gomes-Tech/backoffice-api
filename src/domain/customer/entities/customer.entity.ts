export class Customer {
  constructor(
    public readonly id: string,
    public name: string,
    public lastname: string,
    public phone: string,
    public taxIdentifier: string,
    public birthDate: string,
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
  constructor(
    id: string,
    name: string,
    lastname: string,
    phone: string,
    taxIdentifier: string,
    birthDate: string,
    email: string,
    password: string,
  ) {
    super(id, name, lastname, phone, taxIdentifier, birthDate, email, password);
  }
}

export class UpdateUser {
  constructor(
    public name?: string,
    public email?: string,
    public password?: string,
  ) {}
}
