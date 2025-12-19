export class Post {
  constructor(
    public readonly id: string,
    public title: string,
    public imageUrl: string,
    public imageKey: string,
    public link: string,
    public isActive: boolean,
    public createdAt: Date,
    public createdBy: string,
  ) {}
}

export class CreatePost {
  constructor(
    public readonly id: string,
    public title: string,
    public imageUrl: string,
    public imageKey: string,
    public link: string,
    public isActive: boolean,
    public createdBy: string,
  ) {}
}

export class UpdatePost {
  constructor(
    public title?: string,
    public imageUrl?: string,
    public imageKey?: string,
    public link?: string,
    public isActive?: boolean,
    public updatedBy?: string,
  ) {}
}

