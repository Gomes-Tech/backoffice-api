import { IsNotEmpty, IsString } from 'class-validator';
import { Sanitize } from '@shared/decorators';

export class CreateAttributeDTO {
  @IsNotEmpty()
  @IsString()
  @Sanitize()
  name: string;
}
