import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateBlogDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsUrl()
  link?: string;
}


