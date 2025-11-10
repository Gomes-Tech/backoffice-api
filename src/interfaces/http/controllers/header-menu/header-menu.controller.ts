import {
  CreateHeaderMenuUseCase,
  DeleteHeaderMenuUseCase,
  FindAllHeaderMenuUseCase,
  FindHeaderMenuByIdUseCase,
  UpdateHeaderMenuUseCase,
} from '@app/header-menu';
import { AuthType, Public, Roles, UserId } from '@interfaces/http/decorators';
import {
  CreateHeaderMenuDTO,
  UpdateHeaderMenuDTO,
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

@AuthType(['user'])
@Controller('header-menu')
export class HeaderMenuController {
  constructor(
    private readonly findAllHeaderMenuUseCase: FindAllHeaderMenuUseCase,
    private readonly findHeaderMenuByIdUseCase: FindHeaderMenuByIdUseCase,
    private readonly createHeaderMenuUseCase: CreateHeaderMenuUseCase,
    private readonly updateHeaderMenuUseCase: UpdateHeaderMenuUseCase,
    private readonly deleteHeaderMenuUseCase: DeleteHeaderMenuUseCase,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.findAllHeaderMenuUseCase.execute();
  }

  @Public()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return await this.findHeaderMenuByIdUseCase.execute(id);
  }

  @Roles('admin')
  @Post()
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateHeaderMenuDTO, @UserId() userId: string) {
    await this.createHeaderMenuUseCase.execute(dto, userId);
  }

  @Roles('admin')
  @Patch('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Body() dto: UpdateHeaderMenuDTO,
    @UserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.updateHeaderMenuUseCase.execute(id, dto, userId);
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteHeaderMenuUseCase.execute(id, userId);
  }
}
