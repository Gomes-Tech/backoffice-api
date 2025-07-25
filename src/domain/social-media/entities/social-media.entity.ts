export class BaseSocialMedia {
  constructor(
    public readonly id: string,
    public name: string,
    public link: string,
    public imageUrl: string,
    public imageKey: string,
    public imageAlt: string,
    public order: number,
    public isActive: boolean,
    public showHeader: boolean,
    public showFooter: boolean,
  ) {}
}

export class SocialMedia extends BaseSocialMedia {
  constructor(
    id: string,
    name: string,
    link: string,
    imageUrl: string,
    imageKey: string,
    imageAlt: string,
    order: number,
    isActive: boolean,
    showHeader: boolean,
    showFooter: boolean,
    public createdAt: Date,
    public createdBy: string,
  ) {
    super(
      id,
      name,
      link,
      imageUrl,
      imageKey,
      imageAlt,
      order,
      isActive,
      showHeader,
      showFooter,
    );
  }
}

export class CreateSocialMedia extends BaseSocialMedia {
  constructor(
    id: string,
    name: string,
    link: string,
    order: number,
    imageUrl: string,
    imageKey: string,
    imageAlt: string,
    isActive: boolean,
    showHeader: boolean,
    showFooter: boolean,
    public createdBy: string,
  ) {
    super(
      id,
      name,
      link,
      imageUrl,
      imageKey,
      imageAlt,
      order,
      isActive,
      showHeader,
      showFooter,
    );
  }
}

export class UpdateSocialMedia {
  constructor(
    public updatedBy: string,
    public name?: string,
    public link?: string,
    public order?: number,
    public imageAlt?: string,
    public isActive?: boolean,
    public showHeader?: boolean,
    public showFooter?: boolean,
  ) {}
}
