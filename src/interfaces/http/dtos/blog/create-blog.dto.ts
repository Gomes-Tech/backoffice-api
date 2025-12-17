import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateBlogDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsUrl()
  link: string;
}


