import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateCartItemDTO {
  @IsNotEmpty()
  @IsInt()
  quantity: number;
}
