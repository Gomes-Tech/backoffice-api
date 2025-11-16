import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword, Sanitize } from '@shared/decorators';

export class CreateCustomerDTO {
  @IsNotEmpty()
  @IsString()
  @Sanitize()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Sanitize()
  lastname: string;

  @IsNotEmpty()
  @IsString()
  birthDate: string;

  @IsNotEmpty()
  @IsString()
  taxIdentifier: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

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
}
