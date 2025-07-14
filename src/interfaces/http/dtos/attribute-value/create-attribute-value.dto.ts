import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAttributeValueDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsNotEmpty()
  @IsString()
  attribute: string;
}
