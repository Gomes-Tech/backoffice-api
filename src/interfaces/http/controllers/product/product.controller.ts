import {
  CreateProductUseCase,
  DeleteProductUseCase,
  FindAllProductUseCase,
  FindAllProductViewUseCase,
  FindProductAttributesUseCase,
  FindProductByIdUseCase,
  FindProductBySlugUseCase,
  UpdateProductUseCase,
} from '@app/product';
import { AuthType, Public, Roles, UserId } from '@interfaces/http/decorators';
import { CreateProductDTO, UpdateProductDTO } from '@interfaces/http/dtos';
import { FindProductsFilterDto } from '@interfaces/http/dtos/product/find-all-query.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MaxFileSize } from '@shared/decorators';

export type ProductFile = Express.Multer.File & {
  isFirst?: boolean;
};
@AuthType(['user'])
@Controller('products')
export class ProductController {
  constructor(
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
    private readonly findProductByIdSlugUseCase: FindProductBySlugUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly findAllProductViewUseCase: FindAllProductViewUseCase,
    private readonly findAllProductUseCase: FindAllProductUseCase,
    private readonly findProductAttributesUseCase: FindProductAttributesUseCase,
  ) {}

  @Public()
  @Get('/list-view')
  async getProductListView(@Query() filters: FindProductsFilterDto) {
    return this.findAllProductViewUseCase.execute(filters);
  }

  @Public()
  @Get('/attributes')
  async getProductAttributes(@Query('productIds') productIds: string[]) {
    return await this.findProductAttributesUseCase.execute(productIds);
  }

  @Roles('admin')
  @Get('/admin')
  async getAllProductsAdmin() {
    return await this.findAllProductUseCase.execute();
  }

  @Public()
  @Get('/:slug')
  async getProductById(@Param('slug') slug: string) {
    return this.findProductByIdSlugUseCase.execute(slug);
  }

  @AuthType(['user'])
  @Get('/admin/:id')
  async getProductByIdAdmin(@Param('id') id: string) {
    return this.findProductByIdUseCase.execute(id);
  }

  @MaxFileSize(undefined, 10) // 10MB por arquivo
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'desktopImages' },
      { name: 'mobileImages' },
    ]),
  )
  async create(
    @Body() dto: CreateProductDTO,
    @UserId() userId: string,
    @UploadedFiles()
    files?: {
      desktopImages?: ProductFile[];
      mobileImages?: ProductFile[];
    },
  ) {
    await this.createProductUseCase.execute(dto, userId, files || {});
  }

  @MaxFileSize(undefined, 10) // 10MB por arquivo
  @Patch('/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'desktopImages' },
      { name: 'mobileImages' },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDTO,
    @UserId() userId: string,
    @UploadedFiles()
    files?: {
      desktopImages?: ProductFile[];
      mobileImages?: ProductFile[];
    },
  ) {
    await this.updateProductUseCase.execute(id, dto, userId, files || {});
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteProductUseCase.execute(id, userId);
  }
}
