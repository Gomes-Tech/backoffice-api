export class FooterMenu {
  constructor(
    public readonly id: string,
    public name: string,
    public isActive: boolean,
    public items: FooterMenuItem[],
  ) {}
}

class FooterMenuItem {
  constructor(
    public readonly id: string,
    public type: string,
    public url?: string,
    public imageUrl?: string,
    public imageAlt?: string,
    public imageWidth?: string,
    public imageHeight?: string,
    public content?: string,
  ) {}
}

class CreateOrUpdateFooterMenuItem extends FooterMenuItem {
  constructor(
    id: string,
    type: string,
    url?: string,
    imageUrl?: string,
    imageAlt?: string,
    imageWidth?: string,
    imageHeight?: string,
    content?: string,
    public imageKey?: string,
  ) {
    super(id, type, url, imageUrl, imageAlt, imageWidth, imageHeight, content);
  }
}

export class ListFooterMenu {
  constructor(
    public readonly id: string,
    public name: string,
    public isActive: boolean,
    public createdBy: string,
    public createdAt: Date,
  ) {}
}

export class CreateFooterMenu {
  constructor(
    public readonly id: string,
    public name: string,
    public isActive: boolean,
    public items: CreateOrUpdateFooterMenuItem[],
    public createdBy: string,
  ) {}
}

export class UpdateFooterMenu {
  constructor(
    public name?: string,
    public isActive?: boolean,
    public items?: CreateOrUpdateFooterMenuItem[],
    public updatedBy?: string,
  ) {}
}
