import { IsOptional, IsString } from 'class-validator';
import { IsStrongPassword } from '@shared/decorators/strong-password.decorator';

export class UpdateCustomer {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsStrongPassword({
    message:
      'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números',
  })
  password?: string;
}
