export class Attribute {
  constructor(
    public readonly id: string,
    public name: string,
  ) {}
}

export class CreateAttribute extends Attribute {
  constructor(
    id: string,
    name: string,
    public createdBy: string,
  ) {
    super(id, name);
  }
}

export class UpdateAttribute {
  constructor(
    public updatedBy: string,
    public name?: string,
  ) {}
}
