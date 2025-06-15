export class BaseHeaderMenu {
  constructor(
    public readonly id: string,
    public name: string,
    public link: string,
    public order: number,
    public isActive: boolean,
  ) {}
}

export class HeaderMenu extends BaseHeaderMenu {
  constructor(
    id: string,
    name: string,
    link: string,
    order: number,
    isActive: boolean,
    public createdAt: Date,
    public createdBy: string,
  ) {
    super(id, name, link, order, isActive);
  }
}

export class CreateHeaderMenu extends BaseHeaderMenu {
  constructor(
    id: string,
    name: string,
    link: string,
    order: number,
    isActive: boolean,
    public createdBy: string,
  ) {
    super(id, name, link, order, isActive);
  }
}

export class UpdateHeaderMenu {
  constructor(
    public updatedBy: string,
    public name?: string,
    public isActive?: boolean,
    public link?: string,
    public order?: number,
  ) {}
}
