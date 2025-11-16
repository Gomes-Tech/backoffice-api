import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword, Sanitize } from '@shared/decorators';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Sanitize()
  name: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    message:
      'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números',
  })
  password: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsNotEmpty()
  @IsString()
  role: string;
}
