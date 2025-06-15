import {
  CreateSocialMediaUseCase,
  DeleteSocialMediaUseCase,
  FindAllSocialMediaUseCase,
  FindSocialMediaByIdUseCase,
  UpdateSocialMediaUseCase,
} from '@app/social-media';
import { UserId } from '@interfaces/http/decorators';
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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

@Controller('social-media')
export class SocialMediaController {
  constructor(
    private readonly findAllSocialMediaUseCase: FindAllSocialMediaUseCase,
    private readonly findSocialMediaByIdUseCase: FindSocialMediaByIdUseCase,
    private readonly createSocialMediaUseCase: CreateSocialMediaUseCase,
    private readonly updateSocialMediaUseCase: UpdateSocialMediaUseCase,
    private readonly deleteSocialMediaUseCase: DeleteSocialMediaUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.findAllSocialMediaUseCase.execute();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return await this.findSocialMediaByIdUseCase.execute(id);
  }

  @Post()
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateSocialMediaDTO, @UserId() userId: string) {
    await this.createSocialMediaUseCase.execute(dto, userId);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Body() dto: UpdateSocialMediaDTO,
    @UserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.updateSocialMediaUseCase.execute(id, dto, userId);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteSocialMediaUseCase.execute(id, userId);
  }
}
