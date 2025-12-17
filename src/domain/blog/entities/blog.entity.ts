export class Blog {
  constructor(
    public readonly id: string,
    public title: string,
    public blogImageUrl: string,
    public blogImageKey: string,
    public link: string,
    public createdAt: Date,
    public createdBy: string,
  ) {}
}

export class CreateBlog {
  constructor(
    public readonly id: string,
    public title: string,
    public blogImageUrl: string,
    public blogImageKey: string,
    public link: string,
    public createdBy: string,
  ) {}
}

export class UpdateBlog {
  constructor(
    public title?: string,
    public blogImageUrl?: string,
    public blogImageKey?: string,
    public link?: string,
    public updatedBy?: string,
  ) {}
}
