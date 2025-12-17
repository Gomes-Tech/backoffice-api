export enum StoreBenefitType {
  LINK = 'LINK',
  MODAL = 'MODAL',
}

export class StoreBenefit {
  constructor(
    public readonly id: string,
    public title: string,
    public subtitle: string | null,
    public type: StoreBenefitType | null,
    public imageUrl: string | null,
    public imageKey: string | null,
    public modalContent: string | null,
    public link: string | null,
    public linkText: string | null,
    public order: number,
    public createdAt: Date,
    public createdBy: string,
  ) {}
}

export class ListStoreBenefit {
  constructor(
    public readonly id: string,
    public title: string,
    public subtitle: string | null,
    public type: StoreBenefitType | null,
    public imageUrl: string | null,
    public imageKey: string | null,
    public modalContent: string | null,
    public link: string | null,
    public linkText: string | null,
    public order: number,
    public createdAt: Date,
    public createdBy: string,
  ) {}
}

export class CreateStoreBenefit {
  constructor(
    public readonly id: string,
    public title: string,
    public subtitle: string | null,
    public type: StoreBenefitType | null,
    public imageUrl: string | null,
    public imageKey: string | null,
    public modalContent: string | null,
    public link: string | null,
    public linkText: string | null,
    public order: number,
    public createdBy: string,
  ) {}
}

export class UpdateStoreBenefit {
  constructor(
    public title?: string,
    public subtitle?: string,
    public type?: StoreBenefitType | null,
    public imageUrl?: string | null,
    public imageKey?: string | null,
    public modalContent?: string | null,
    public link?: string | null,
    public linkText?: string | null,
    public order?: number,
    public updatedBy?: string,
  ) {}
}
