import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
