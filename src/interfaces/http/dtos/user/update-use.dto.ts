import {
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @IsString()
  photo?: string;
}
