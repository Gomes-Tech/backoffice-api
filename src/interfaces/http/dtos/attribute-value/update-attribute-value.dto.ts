import { IsOptional, IsString } from 'class-validator';

export class UpdateAttributeValueDTO {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  value: string;
}
