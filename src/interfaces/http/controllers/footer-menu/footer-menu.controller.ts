import {
  CreateFooterMenuUseCase,
  DeleteFooterMenuUseCase,
  FindAllFooterMenuUseCase,
  FindFooterMenuByIdUseCase,
  GetAllFooterMenuUseCase,
  UpdateFooterMenuUseCase,
} from '@app/footer-menu';
import { FooterMenu, ListFooterMenu } from '@domain/footer-menu';
import { AuthType, Public, Roles, UserId } from '@interfaces/http/decorators';
import {
  CreateFooterMenuDTO,
  UpdateFooterMenuDTO,
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
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@AuthType('user')
@Controller('footer-menus')
export class FooterMenuController {
  constructor(
    private readonly findAllFooterMenuUseCase: FindAllFooterMenuUseCase,
    private readonly getAllFooterMenuUseCase: GetAllFooterMenuUseCase,
    private readonly findFooterMenuByIdUseCase: FindFooterMenuByIdUseCase,
    private readonly createFooterMenuUseCase: CreateFooterMenuUseCase,
    private readonly updateFooterMenuUseCase: UpdateFooterMenuUseCase,
    private readonly deleteFooterMenuUseCase: DeleteFooterMenuUseCase,
  ) {}

  @Get()
  async findAll(): Promise<ListFooterMenu[]> {
    return await this.findAllFooterMenuUseCase.execute();
  }

  @Public()
  @Get('/list')
  async getAll(): Promise<FooterMenu[]> {
    return await this.getAllFooterMenuUseCase.execute();
  }

  @Get('/:id')
  async findById(@Param('id') id: string): Promise<FooterMenu> {
    return await this.findFooterMenuByIdUseCase.execute(id);
  }

  @Roles('admin')
  @Post()
  @UsePipes(ValidationPipe)
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateFooterMenuDTO,
    @UploadedFiles() files: Express.Multer.File[],
    @UserId() userId: string,
  ) {
    await this.createFooterMenuUseCase.execute(dto, userId, files);
  }

  @Roles('admin')
  @Patch('/:id')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFooterMenuDTO,
    @UploadedFiles() files: Express.Multer.File[],
    @UserId() userId: string,
  ) {
    await this.updateFooterMenuUseCase.execute(id, dto, files, userId);
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteFooterMenuUseCase.execute(id, userId);
  }
}
