import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  FindAllCategoriesUseCase,
  FindCategoryByIdUseCase,
  FindCategoryTreeUseCase,
  UpdateCategoryUseCase,
} from '@app/category';
import { Public, Roles, UserId } from '@interfaces/http/decorators';
import { CreateCategoryDTO, UpdateCategoryDTO } from '@interfaces/http/dtos';
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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

@Controller('categories')
export class CategoryController {
  constructor(
    private readonly findAllCategoriesUseCase: FindAllCategoriesUseCase,
    private readonly findCategoryTreeUseCase: FindCategoryTreeUseCase,
    private readonly findCategoryByIdUseCase: FindCategoryByIdUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll() {
    return await this.findAllCategoriesUseCase.execute();
  }

  @Public()
  @Get('/tree')
  @HttpCode(HttpStatus.OK)
  async findTree() {
    return await this.findCategoryTreeUseCase.execute();
  }

  @Public()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return await this.findCategoryByIdUseCase.execute(id);
  }

  @Roles('admin')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() dto: CreateCategoryDTO, @UserId() userId: string) {
    await this.createCategoryUseCase.execute(dto, userId);
  }

  @Roles('admin')
  @Patch('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Body() dto: UpdateCategoryDTO,
    @UserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.updateCategoryUseCase.execute(id, dto, userId);
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteCategoryUseCase.execute(id, userId);
  }
}
