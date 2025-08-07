import {
  CreateRoleUseCase,
  DeleteRoleUseCase,
  FindAllRoleUseCase,
  FindRoleByIdUseCase,
  UpdateRoleUseCase,
} from '@app/role';
import { Roles, UserId } from '@interfaces/http/decorators';
import { CreateRoleDTO, UpdateRoleDTO } from '@interfaces/http/dtos';
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
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
@ApiTags('roles')
@ApiBearerAuth()
@Roles('admin')
@Controller('roles')
export class RoleController {
  constructor(
    private readonly findAllRoleUseCase: FindAllRoleUseCase,
    private readonly findRoleByIdUseCase: FindRoleByIdUseCase,
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll() {
    return await this.findAllRoleUseCase.execute();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  async findById(@Param('id') id: string) {
    return await this.findRoleByIdUseCase.execute(id);
  }

  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() dto: CreateRoleDTO, @UserId() userId: string) {
    await this.createRoleUseCase.execute(dto, userId);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Body() dto: UpdateRoleDTO,
    @UserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.updateRoleUseCase.execute(id, dto, userId);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteRoleUseCase.execute(id, userId);
  }
}
