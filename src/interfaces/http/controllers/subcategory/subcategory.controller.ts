import {
  CreateSubCategoryUseCase,
  DeleteSubCategoryUseCase,
  FindAllSubCategoriesUseCase,
  FindSubCategoryBuIdUseCase,
  UpdateSubCategoryUseCase,
} from '@app/subcategory';
import { FindSubCategoriesFilters } from '@domain/subcategory';
import { Roles, UserId } from '@interfaces/http/decorators';
import {
  CreateSubCategoryDTO,
  FindAllSubCategoriesQueryDTO,
  UpdateSubCategoryDTO,
} from '@interfaces/http/dtos';
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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

@Roles('admin')
@Controller('subcategories')
export class SubCategoryController {
  constructor(
    private readonly findAllSubCategoriesUseCase: FindAllSubCategoriesUseCase,
    private readonly findSubCategoryByIdUseCase: FindSubCategoryBuIdUseCase,
    private readonly createSubCategoryUseCase: CreateSubCategoryUseCase,
    private readonly updateSubCategoryUseCase: UpdateSubCategoryUseCase,
    private readonly deleteSubCategoryUseCase: DeleteSubCategoryUseCase,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query() query: FindAllSubCategoriesQueryDTO) {
    const filters: FindSubCategoriesFilters = {
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

    return await this.findAllSubCategoriesUseCase.execute(filters);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return await this.findSubCategoryByIdUseCase.execute(id);
  }

  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() dto: CreateSubCategoryDTO, @UserId() userId: string) {
    await this.createSubCategoryUseCase.execute(dto, userId);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Body() dto: UpdateSubCategoryDTO,
    @UserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.updateSubCategoryUseCase.execute(id, dto, userId);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteSubCategoryUseCase.execute(id, userId);
  }
}
