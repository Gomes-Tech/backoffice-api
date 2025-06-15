export class BaseSocialMedia {
  constructor(
    public readonly id: string,
    public name: string,
    public link: string,
    public order: number,
    public isActive: boolean,
  ) {}
}

export class SocialMedia extends BaseSocialMedia {
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

export class CreateSocialMedia extends BaseSocialMedia {
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

export class UpdateSocialMedia {
  constructor(
    public updatedBy: string,
    public name?: string,
    public link?: string,
    public order?: number,
    public isActive?: boolean,
  ) {}
}
