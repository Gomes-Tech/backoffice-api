import {
  CreateSocialMediaUseCase,
  DeleteSocialMediaUseCase,
  FindAllSocialMediaUseCase,
  FindSocialMediaByIdUseCase,
  UpdateSocialMediaUseCase,
} from '@app/social-media';
import { ListAllSocialMediaUseCase } from '@app/social-media/use-cases/list-all-social-media.use-case copy';
import { Public, Roles, UserId } from '@interfaces/http/decorators';
import {
  CreateSocialMediaDTO,
  UpdateSocialMediaDTO,
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
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('social-media')
export class SocialMediaController {
  constructor(
    private readonly findAllSocialMediaUseCase: FindAllSocialMediaUseCase,
    private readonly listAllSocialMediaUseCase: ListAllSocialMediaUseCase,
    private readonly findSocialMediaByIdUseCase: FindSocialMediaByIdUseCase,
    private readonly createSocialMediaUseCase: CreateSocialMediaUseCase,
    private readonly updateSocialMediaUseCase: UpdateSocialMediaUseCase,
    private readonly deleteSocialMediaUseCase: DeleteSocialMediaUseCase,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.findAllSocialMediaUseCase.execute();
  }

  @Get('/list')
  async list() {
    return await this.listAllSocialMediaUseCase.execute();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return await this.findSocialMediaByIdUseCase.execute(id);
  }

  @Roles('admin')
  @Post()
  @UsePipes(ValidationPipe)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'header', maxCount: 1 },
      { name: 'footer', maxCount: 1 },
    ]),
  )
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateSocialMediaDTO,
    @UserId() userId: string,
    @UploadedFiles()
    files: {
      header?: Express.Multer.File[];
      footer?: Express.Multer.File[];
    },
  ) {
    const header = files.header?.[0];
    const footer = files.footer?.[0];

    await this.createSocialMediaUseCase.execute(dto, userId, header, footer);
  }

  @Roles('admin')
  @Patch('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Body() dto: UpdateSocialMediaDTO,
    @UserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.updateSocialMediaUseCase.execute(id, dto, userId);
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteSocialMediaUseCase.execute(id, userId);
  }
}
