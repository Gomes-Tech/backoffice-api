import {
  CreateAttributeValueUseCase,
  DeleteAttributeValueUseCase,
  FindAllAttributeValueByAttributeUseCase,
  FindAllAttributeValueUseCase,
  UpdateAttributeValueUseCase,
} from '@app/attribute-value';
import { AttributeValue } from '@domain/attribute-value';
import { AuthType, Public, Roles, UserId } from '@interfaces/http/decorators';
import {
  CreateAttributeValueDTO,
  UpdateAttributeValueDTO,
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

@AuthType(['user', 'api'])
@Controller('attribute-values')
export class AttributeValueController {
  constructor(
    private readonly findAllAttributeValueByAttributeUseCase: FindAllAttributeValueByAttributeUseCase,
    private readonly findAllAttributeValueUseCase: FindAllAttributeValueUseCase,
    private readonly createAttributeValueUseCase: CreateAttributeValueUseCase,
    private readonly updateAttributeValueUseCase: UpdateAttributeValueUseCase,
    private readonly deleteAttributeValueUseCase: DeleteAttributeValueUseCase,
  ) {}

  @Public()
  @Get()
  async findAll(): Promise<AttributeValue[]> {
    return await this.findAllAttributeValueUseCase.execute();
  }

  @Public()
  @Get('/:attributeId')
  async findAllByAttributeId(
    @Param('attributeId') attributeId: string,
  ): Promise<AttributeValue[]> {
    return await this.findAllAttributeValueByAttributeUseCase.execute(
      attributeId,
    );
  }

  @Roles('admin')
  @Post()
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAttributeValueDTO, @UserId() userId: string) {
    await this.createAttributeValueUseCase.execute(dto, userId);
  }

  @Roles('admin')
  @Patch('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAttributeValueDTO,
    @UserId() userId: string,
  ) {
    await this.updateAttributeValueUseCase.execute(id, dto, userId);
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteAttributeValueUseCase.execute(id, userId);
  }
}
