import {
  DeleteUserUseCase,
  FindAllUsersUseCase,
  FindUserByIdUseCase,
  UpdateUserUseCase,
} from '@app/user';
import { ListUser } from '@domain/user';
import { Roles } from '@interfaces/http/decorators';
import { UpdateUserDto } from '@interfaces/http/dtos';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {
  constructor(
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Roles('admin')
  @Get()
  async getList(): Promise<ListUser[]> {
    return await this.findAllUsersUseCase.execute();
  }

  @Get('/:id')
  async findById(@Param('id') id: string) {
    return await this.findUserByIdUseCase.execute(id);
  }

  @Patch('/:id')
  @UseInterceptors(FileInterceptor('photo'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    await this.updateUserUseCase.execute(id, dto, photo);
  }

  @Roles('admin')
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.deleteUserUseCase.execute(id);
  }
}
