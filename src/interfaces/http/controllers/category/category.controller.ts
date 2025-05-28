import {
  CreateCategoryUseCase,
  FindAllCategoriesUseCase,
  FindCategoryBuIdUseCase,
  UpdateCategoryUseCase,
} from '@app/category';
import { FindCategoriesFilters } from '@domain/category';
import { Roles, UserId } from '@interfaces/http/decorators';
import {
  CreateCategoryDTO,
  FindAllCategoriesQueryDTO,
  UpdateCategoryDTO,
} from '@interfaces/http/dtos';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

@Roles('admin')
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly findAllCategoriesUseCase: FindAllCategoriesUseCase,
    private readonly findCategoryByIdUseCase: FindCategoryBuIdUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query() query: FindAllCategoriesQueryDTO) {
    const filters: FindCategoriesFilters = {
      where: {
        name: query?.name,
      },
      orderBy: {
        field: query.orderByField,
        direction: query.orderByDirection,
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    };

    return await this.findAllCategoriesUseCase.execute(filters);
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
}
