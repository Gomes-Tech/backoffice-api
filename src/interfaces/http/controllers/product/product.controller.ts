import { CreateProductUseCase, DeleteProductUseCase } from '@app/product';
import { AuthType, Roles, UserId } from '@interfaces/http/decorators';
import { CreateProductDTO } from '@interfaces/http/dtos';
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

export type ProductFile = Express.Multer.File & {
  isFirst?: boolean;
};
@AuthType('user')
@Controller('products')
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

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
      desktopImages: ProductFile[];
      mobileImages: ProductFile[];
    },
    @Body() dto: CreateProductDTO,
    @UserId() userId: string,
  ) {
    await this.createProductUseCase.execute(dto, files, userId);
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteProductUseCase.execute(id, userId);
  }
}
