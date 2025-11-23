import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCartItemDTO {
  @IsNotEmpty()
  @IsString()
  cartId: string;

  @IsNotEmpty()
  @IsString()
  productVariantId: string;

  @IsNotEmpty()
  @IsInt()
  quantity: number;
}
