import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  FindAllCategoriesUseCase,
  FindCategoryByIdUseCase,
  FindCategoryBySlugUseCase,
  FindCategoryTreeUseCase,
  UpdateCategoryUseCase,
} from '@app/category';
import { Public, Roles, UserId } from '@interfaces/http/decorators';
import { AuthType } from '@interfaces/http/decorators/auth.decorator';
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
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('categories')
@ApiBearerAuth()
@AuthType(['user'])
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly findAllCategoriesUseCase: FindAllCategoriesUseCase,
    private readonly findCategoryTreeUseCase: FindCategoryTreeUseCase,
    private readonly findCategoryByIdUseCase: FindCategoryByIdUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly findCategoryBySlugUseCase: FindCategoryBySlugUseCase,
  ) {}

  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todas as categorias no painel admin' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorias retornada com sucesso.',
  })
  @Get()
  async findAll() {
    return await this.findAllCategoriesUseCase.execute();
  }

  @Public()
  @Get('/tree')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter estrutura hierárquica de categorias' })
  @ApiResponse({
    status: 200,
    description: 'Árvore de categorias retornada com sucesso.',
  })
  async findTree() {
    return await this.findCategoryTreeUseCase.execute();
  }

  @Public()
  @Get('/tree/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar categoria por SLUG' })
  @ApiParam({ name: 'slug', type: String })
  @ApiResponse({ status: 200, description: 'Categoria encontrada.' })
  async findBySlug(@Param('slug') slug: string) {
    return await this.findCategoryBySlugUseCase.execute(slug);
  }

  @Public()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Categoria encontrada.' })
  async findById(@Param('id') id: string) {
    return await this.findCategoryByIdUseCase.execute(id);
  }

  @Roles('admin')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Criar uma nova categoria' })
  @ApiBody({ type: CreateCategoryDTO })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso.' })
  @Post()
  async create(
    @Body() dto: CreateCategoryDTO,
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: string,
  ) {
    await this.createCategoryUseCase.execute(dto, file, userId);
  }

  @Roles('admin')
  @Patch('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Atualizar uma categoria existente' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCategoryDTO })
  @ApiNoContentResponse({ description: 'Categoria atualizada com sucesso.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDTO,
    @UserId() userId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    await this.updateCategoryUseCase.execute(id, dto, file, userId);
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar uma categoria' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse({ description: 'Categoria deletada com sucesso.' })
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteCategoryUseCase.execute(id, userId);
  }
}
