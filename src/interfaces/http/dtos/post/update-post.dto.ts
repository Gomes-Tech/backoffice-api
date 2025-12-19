import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdatePostDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

