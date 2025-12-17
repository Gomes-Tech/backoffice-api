import {
  CreateBlogUseCase,
  DeleteBlogUseCase,
  FindAllBlogUseCase,
  FindBlogByIdUseCase,
  UpdateBlogUseCase,
} from '@app/blog';
import { Blog } from '@domain/blog';
import { AuthType, Roles, UserId } from '@interfaces/http/decorators';
import { CreateBlogDTO, UpdateBlogDTO } from '@interfaces/http/dtos';
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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Blogs')
@AuthType(['user'])
@Controller('blogs')
export class BlogController {
  constructor(
    private readonly findAllBlogUseCase: FindAllBlogUseCase,
    private readonly findBlogByIdUseCase: FindBlogByIdUseCase,
    private readonly createBlogUseCase: CreateBlogUseCase,
    private readonly updateBlogUseCase: UpdateBlogUseCase,
    private readonly deleteBlogUseCase: DeleteBlogUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar blogs' })
  @ApiResponse({ status: 200, type: [Blog] })
  async findAll(): Promise<Blog[]> {
    return await this.findAllBlogUseCase.execute();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Buscar blog por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: Blog })
  async findById(@Param('id') id: string): Promise<Blog> {
    return await this.findBlogByIdUseCase.execute(id);
  }

  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar um novo blog' })
  @ApiBody({ type: CreateBlogDTO })
  async create(
    @Body() dto: CreateBlogDTO,
    @UserId() userId: string,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<void> {
    await this.createBlogUseCase.execute(
      dto.title,
      dto.link,
      userId,
      image?.path ?? '',
      image?.filename ?? '',
    );
  }

  @Roles('admin')
  @Patch('/:id')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Atualizar um blog' })
  @ApiBody({ type: UpdateBlogDTO })
  @ApiNoContentResponse({ description: 'Blog atualizado com sucesso.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDTO,
    @UserId() userId: string,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<void> {
    await this.updateBlogUseCase.execute(
      id,
      {
        title: dto.title,
        link: dto.link,
        blogImageUrl: image?.path,
        blogImageKey: image?.filename,
      },
      userId,
    );
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir um blog' })
  async delete(
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<void> {
    await this.deleteBlogUseCase.execute(id, userId);
  }
}
