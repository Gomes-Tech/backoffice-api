import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  FindAllCategoriesUseCase,
  FindCategoryBuIdUseCase,
  FindCategoryTreeUseCase,
  UpdateCategoryUseCase,
} from '@app/category';
import { Roles, UserId } from '@interfaces/http/decorators';
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

@Roles('admin')
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly findAllCategoriesUseCase: FindAllCategoriesUseCase,
    private readonly findCategoryTreeUseCase: FindCategoryTreeUseCase,
    private readonly findCategoryByIdUseCase: FindCategoryBuIdUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll() {
    return await this.findAllCategoriesUseCase.execute();
  }

  @Get('/tree')
  @HttpCode(HttpStatus.OK)
  async findTree() {
    return await this.findCategoryTreeUseCase.execute();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return await this.findCategoryByIdUseCase.execute(id);
  }

  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() dto: CreateCategoryDTO, @UserId() userId: string) {
    await this.createCategoryUseCase.execute(dto, userId);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Body() dto: UpdateCategoryDTO,
    @UserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.updateCategoryUseCase.execute(id, dto, userId);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteCategoryUseCase.execute(id, userId);
  }
}
