import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from '@shared/decorators/strong-password.decorator';

export class ResetPasswordDTO {
  @IsNotEmpty()
  @IsString()
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    message:
      'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números',
  })
  password: string;
}
