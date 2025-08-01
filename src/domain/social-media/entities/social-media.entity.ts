export class BaseSocialMedia {
  constructor(
    public readonly id: string,
    public name: string,
    public link: string,
    public headerImageUrl: string,
    public headerImageKey: string,
    public headerImageAlt: string,
    public footerImageKey: string,
    public footerImageUrl: string,
    public footerImageAlt: string,
    public order: number,
    public isActive: boolean,
    public showHeader: boolean,
    public showFooter: boolean,
  ) {}
}

export class ListSocialMedia {
  constructor(
    public readonly id: string,
    public name: string,
    public link: string,
    public isActive: boolean,
    public order: number,
    public createdAt: Date,
    public createdBy: string,
  ) {}
}

export class SocialMedia extends BaseSocialMedia {
  constructor(
    id: string,
    name: string,
    link: string,
    headerImageUrl: string,
    headerImageKey: string,
    headerImageAlt: string,
    footerImageKey: string,
    footerImageUrl: string,
    footerImageAlt: string,
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
      headerImageUrl,
      headerImageKey,
      headerImageAlt,
      footerImageKey,
      footerImageUrl,
      footerImageAlt,
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
    headerImageUrl: string,
    headerImageKey: string,
    headerImageAlt: string,
    footerImageKey: string,
    footerImageUrl: string,
    footerImageAlt: string,
    isActive: boolean,
    showHeader: boolean,
    showFooter: boolean,
    public createdBy: string,
  ) {
    super(
      id,
      name,
      link,
      headerImageUrl,
      headerImageKey,
      headerImageAlt,
      footerImageKey,
      footerImageUrl,
      footerImageAlt,
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
    public isActive?: boolean,
    public showHeader?: boolean,
    public showFooter?: boolean,
  ) {}
}
