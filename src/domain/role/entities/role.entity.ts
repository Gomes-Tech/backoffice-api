export class Role {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public isActive: boolean,
    public createdBy: string,
    public createdAt: Date,
  ) {}
}

export class CreateRole extends Role {
  constructor(
    id: string,
    name: string,
    description: string,
    isActive: boolean,
    createdBy: string,
  ) {
    super(id, name, description, isActive, createdBy, null);
  }
}

export class UpdateRole {
  constructor(
    public updatedBy: string,
    public name?: string,
    public description?: string,
    public isActive?: boolean,
  ) {}
}
