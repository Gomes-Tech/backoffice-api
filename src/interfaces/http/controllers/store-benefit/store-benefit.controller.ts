import {
  CreateStoreBenefitUseCase,
  DeleteStoreBenefitUseCase,
  FindAllStoreBenefitUseCase,
  FindStoreBenefitByIdUseCase,
  ListStoreBenefitUseCase,
  UpdateStoreBenefitUseCase,
} from '@app/store-benefit';
import {
  StoreBenefit,
  ListStoreBenefit,
} from '@domain/store-benefit';
import {
  AuthType,
  Public,
  Roles,
  UserId,
} from '@interfaces/http/decorators';
import {
  CreateStoreBenefitDTO,
  UpdateStoreBenefitDTO,
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

@ApiTags('Store Benefits')
@AuthType(['user'])
@Controller('store-benefits')
export class StoreBenefitController {
  constructor(
    private readonly findAllStoreBenefitUseCase: FindAllStoreBenefitUseCase,
    private readonly listStoreBenefitUseCase: ListStoreBenefitUseCase,
    private readonly findStoreBenefitByIdUseCase: FindStoreBenefitByIdUseCase,
    private readonly createStoreBenefitUseCase: CreateStoreBenefitUseCase,
    private readonly updateStoreBenefitUseCase: UpdateStoreBenefitUseCase,
    private readonly deleteStoreBenefitUseCase: DeleteStoreBenefitUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar benefícios (admin)' })
  @ApiResponse({ status: 200, type: [ListStoreBenefit] })
  async findAll(): Promise<ListStoreBenefit[]> {
    return await this.findAllStoreBenefitUseCase.execute();
  }

  @Public()
  @Get('/list')
  @ApiOperation({ summary: 'Listar benefícios públicos' })
  @ApiResponse({ status: 200, type: [StoreBenefit] })
  async list(): Promise<StoreBenefit[]> {
    return await this.listStoreBenefitUseCase.execute();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Buscar benefício por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: StoreBenefit })
  async findById(@Param('id') id: string): Promise<StoreBenefit> {
    return await this.findStoreBenefitByIdUseCase.execute(id);
  }

  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar um novo benefício' })
  @ApiBody({ type: CreateStoreBenefitDTO })
  async create(
    @Body() dto: CreateStoreBenefitDTO,
    @UserId() userId: string,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<void> {
    await this.createStoreBenefitUseCase.execute(dto, userId, image);
  }

  @Roles('admin')
  @Patch('/:id')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Atualizar um benefício' })
  @ApiBody({ type: UpdateStoreBenefitDTO })
  @ApiNoContentResponse({ description: 'Benefício atualizado com sucesso.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStoreBenefitDTO,
    @UserId() userId: string,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<void> {
    await this.updateStoreBenefitUseCase.execute(id, dto, userId, image);
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir um benefício' })
  async delete(
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<void> {
    await this.deleteStoreBenefitUseCase.execute(id, userId);
  }
}


