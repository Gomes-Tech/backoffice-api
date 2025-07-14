export class AttributeValue {
  constructor(
    public readonly id: string,
    public name: string,
    public value: string,
  ) {}
}

export class CreateAttributeValue extends AttributeValue {
  constructor(
    id: string,
    name: string,
    value: string,
    public attribute: string,
    public createdBy: string,
  ) {
    super(id, name, value);
  }
}

export class UpdateAttributeValue {
  constructor(
    public updatedBy: string,
    public name?: string,
    public value?: string,
  ) {}
}
