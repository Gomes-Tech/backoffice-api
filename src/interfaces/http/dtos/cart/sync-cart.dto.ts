import { IsArray, IsNotEmpty } from 'class-validator';

export class SyncCartDTO {
  @IsNotEmpty()
  @IsArray()
  items: {
    productVariantId: string;
    quantity: number;
  }[];
}
