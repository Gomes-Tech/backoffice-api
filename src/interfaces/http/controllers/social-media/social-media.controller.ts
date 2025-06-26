import {
  CreateSocialMediaUseCase,
  DeleteSocialMediaUseCase,
  FindAllSocialMediaUseCase,
  FindSocialMediaByIdUseCase,
  UpdateSocialMediaUseCase,
} from '@app/social-media';
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
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('social-media')
export class SocialMediaController {
  constructor(
    private readonly findAllSocialMediaUseCase: FindAllSocialMediaUseCase,
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

  @Public()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return await this.findSocialMediaByIdUseCase.execute(id);
  }

  @Roles('admin')
  @Post()
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateSocialMediaDTO,
    @UserId() userId: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    await this.createSocialMediaUseCase.execute(dto, userId, image);
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
