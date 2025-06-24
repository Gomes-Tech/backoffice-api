class BaseBanner {
  constructor(
    public readonly id: string,
    public name: string,
    public mobileImageUrl: string,
    public mobileImageAlt: string,
    public mobileImageKey: string,
    public desktopImageUrl: string,
    public desktopImageAlt: string,
    public desktopImageKey: string,
    public order: number,
    public isActive: boolean,
    public link?: string,
  ) {}
}

export class Banner extends BaseBanner {
  constructor(
    id: string,
    name: string,
    mobileImageUrl: string,
    mobileImageAlt: string,
    mobileImageKey: string,
    desktopImageUrl: string,
    desktopImageAlt: string,
    desktopImageKey: string,
    order: number,
    isActive: boolean,
    link?: string,
  ) {
    super(
      id,
      name,
      mobileImageUrl,
      mobileImageAlt,
      mobileImageKey,
      desktopImageUrl,
      desktopImageAlt,
      desktopImageKey,
      order,
      isActive,
      link,
    );
  }
}

export type ListBanner = Omit<
  BaseBanner,
  'mobileImageKey' | 'desktopImageKey'
> & {
  createdAt: Date;
  createdBy: string;
};

export class CreateBanner extends BaseBanner {
  constructor(
    id: string,
    name: string,
    mobileImageUrl: string,
    mobileImageAlt: string,
    mobileImageKey: string,
    desktopImageUrl: string,
    desktopImageAlt: string,
    desktopImageKey: string,
    order: number,
    isActive: boolean,
    public createdBy: string,
    link?: string,
  ) {
    super(
      id,
      name,
      mobileImageUrl,
      mobileImageAlt,
      mobileImageKey,
      desktopImageUrl,
      desktopImageAlt,
      desktopImageKey,
      order,
      isActive,
      link,
    );
  }
}

export class UpdateBanner {
  constructor(
    public updatedBy: string,
    public isActive?: boolean,
    public link?: string,
    public order?: number,
    public desktopImageAlt?: string,
    public mobileImageAlt?: string,
    public name?: string,
  ) {}
}
