import {
  CreatePostUseCase,
  DeletePostUseCase,
  FindAllPostUseCase,
  FindPostByIdUseCase,
  UpdatePostUseCase,
} from '@app/post';
import { Post as PostEntity } from '@domain/post';
import { AuthType, Public, Roles, UserId } from '@interfaces/http/decorators';
import { CreatePostDTO, UpdatePostDTO } from '@interfaces/http/dtos';
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

@ApiTags('Posts')
@AuthType(['user'])
@Controller('posts')
export class PostController {
  constructor(
    private readonly findAllPostUseCase: FindAllPostUseCase,
    private readonly findPostByIdUseCase: FindPostByIdUseCase,
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar posts' })
  @ApiResponse({ status: 200, type: [PostEntity] })
  async findAll(): Promise<PostEntity[]> {
    return await this.findAllPostUseCase.execute();
  }

  @Public()
  @Get('/list')
  @ApiOperation({ summary: 'Listar posts ativos' })
  @ApiResponse({ status: 200, type: [PostEntity] })
  async findAllActive(): Promise<PostEntity[]> {
    return await this.findAllPostUseCase.execute();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Buscar post por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: PostEntity })
  async findById(@Param('id') id: string): Promise<PostEntity> {
    return await this.findPostByIdUseCase.execute(id);
  }

  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar um novo post' })
  @ApiBody({ type: CreatePostDTO })
  async create(
    @Body() dto: CreatePostDTO,
    @UserId() userId: string,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<void> {
    await this.createPostUseCase.execute(dto, userId, image);
  }

  @Roles('admin')
  @Patch('/:id')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Atualizar um post' })
  @ApiBody({ type: UpdatePostDTO })
  @ApiNoContentResponse({ description: 'Post atualizado com sucesso.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDTO,
    @UserId() userId: string,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<void> {
    await this.updatePostUseCase.execute(id, dto, userId, image);
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir um post' })
  async delete(
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<void> {
    await this.deletePostUseCase.execute(id, userId);
  }
}
