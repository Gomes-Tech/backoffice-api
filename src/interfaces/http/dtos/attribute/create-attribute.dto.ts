import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAttributeDTO {
  @IsNotEmpty()
  @IsString()
  name: string;
}
