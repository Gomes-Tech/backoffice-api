import {
  CreateBannerUseCase,
  DeleteBannerUseCase,
  FindAllBannersUseCase,
  FindBannerByIdUseCase,
  FindListBannersUseCase,
  UpdateBannerUseCase,
} from '@app/banner';
import { BadRequestException } from '@infra/filters';
import { AuthType, Public, Roles, UserId } from '@interfaces/http/decorators';
import { CreateBannerDTO, UpdateBannerDTO } from '@interfaces/http/dtos';
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
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@AuthType(['user', 'api'])
@Controller('banners')
export class BannerController {
  constructor(
    private readonly findAllBannersUseCase: FindAllBannersUseCase,
    private readonly findListBannersUseCase: FindListBannersUseCase,
    private readonly findBannerByIdUseCase: FindBannerByIdUseCase,
    private readonly createBannerUseCase: CreateBannerUseCase,
    private readonly updateBannerUseCase: UpdateBannerUseCase,
    private readonly deleteBannerUseCase: DeleteBannerUseCase,
  ) {}

  @Roles('admin')
  @Get()
  async getAll() {
    return await this.findAllBannersUseCase.execute();
  }

  @Public()
  @Get('/list')
  async getList() {
    return await this.findListBannersUseCase.execute();
  }

  @Roles('admin')
  @Get('/:id')
  async getById(@Param('id') id: string) {
    return await this.findBannerByIdUseCase.execute(id);
  }

  @Roles('admin')
  @Post()
  @UsePipes(ValidationPipe)
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateBannerDTO,
    @UploadedFiles() files: Express.Multer.File[],
    @UserId() userId: string,
  ) {
    const desktop = files.find((file) => file.fieldname === 'desktop');
    const mobile = files.find((file) => file.fieldname === 'mobile');

    if (!desktop || !mobile) {
      throw new BadRequestException(
        'Imagens desktop e mobile são obrigatórias.',
      );
    }

    await this.createBannerUseCase.execute(dto, { desktop, mobile }, userId);
  }

  @Roles('admin')
  @Patch('/:id')
  @UsePipes(ValidationPipe)
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDTO,
    @UploadedFiles() files: Express.Multer.File[],
    @UserId() userId: string,
  ) {
    const desktop = files.find((file) => file.fieldname === 'desktop');
    const mobile = files.find((file) => file.fieldname === 'mobile');

    await this.updateBannerUseCase.execute(id, dto, userId, {
      desktop,
      mobile,
    });
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteBannerUseCase.execute(id, userId);
  }
}
