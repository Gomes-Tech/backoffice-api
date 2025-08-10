import {
  CreateAttributeUseCase,
  DeleteAttributeUseCase,
  FindAllAttributeUseCase,
  UpdateAttributeUseCase,
} from '@app/attribute';
import { Attribute } from '@domain/attribute';
import { AuthType, Public, Roles, UserId } from '@interfaces/http/decorators';
import { CreateAttributeDTO, UpdateAttributeDTO } from '@interfaces/http/dtos';
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

@AuthType('user')
@Controller('attributes')
export class AttributeController {
  constructor(
    private readonly findAllAttributeUseCase: FindAllAttributeUseCase,
    private readonly createAttributeUseCase: CreateAttributeUseCase,
    private readonly updateAttributeUseCase: UpdateAttributeUseCase,
    private readonly deleteAttributeUseCase: DeleteAttributeUseCase,
  ) {}

  @Public()
  @Get()
  async findAll(): Promise<Attribute[]> {
    return await this.findAllAttributeUseCase.execute();
  }

  @Roles('admin')
  @Post()
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAttributeDTO, @UserId() userId: string) {
    await this.createAttributeUseCase.execute(dto, userId);
  }

  @Roles('admin')
  @Patch('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAttributeDTO,
    @UserId() userId: string,
  ) {
    await this.updateAttributeUseCase.execute(id, dto, userId);
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteAttributeUseCase.execute(id, userId);
  }
}
