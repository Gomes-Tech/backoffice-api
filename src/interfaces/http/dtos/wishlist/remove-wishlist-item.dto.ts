import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveWishlistItemDTO {
  @IsNotEmpty()
  @IsString()
  wishlistItemId: string;
}
