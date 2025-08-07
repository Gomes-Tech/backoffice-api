import { DeleteProductUseCase } from '@app/product';
import { Roles, UserId } from '@interfaces/http/decorators';
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductController {
  constructor(private readonly deleteProductUseCase: DeleteProductUseCase) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'desktopImages' },
      { name: 'mobileImages' },
    ]),
  )
  async create(
    @UploadedFiles()
    files: {
      desktopImages?: Express.Multer.File[];
      mobileImages?: Express.Multer.File[];
    },
    @Body() dto: any,
  ) {}

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteProductUseCase.execute(id, userId);
  }
}
