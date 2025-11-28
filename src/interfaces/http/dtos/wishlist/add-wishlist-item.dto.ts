import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddWishlistItemDTO {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  wishlistId: string;
}
