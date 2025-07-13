import { IsEmail, IsString } from 'class-validator';

export class ResetPasswordDTO {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
