import {
  DeleteUserUseCase,
  FindAllUsersUseCase,
  FindUserByIdUseCase,
  UpdateUserUseCase,
} from '@app/user';
import { ListUser } from '@domain/user';
import {
  AuthType,
  Roles,
  ThrottleUpload,
  UserId,
} from '@interfaces/http/decorators';
import { UpdateUserDto } from '@interfaces/http/dtos';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MaxFileSize } from '@shared/decorators';

@ApiTags('users')
@ApiBearerAuth()
@AuthType(['user'])
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

  @Get('/me')
  async getMe(@Param('id') id: string) {
    return await this.findUserByIdUseCase.execute(id);
  }

  @Get('/:id')
  async findById(
    @Param('id') id: string,
    @UserId() userId: string,
    @Req() req: any,
  ) {
    // Proteção contra IDOR: Passa informações do usuário autenticado
    const userRole = req.user?.role;
    return await this.findUserByIdUseCase.execute(id, userId, userRole);
  }

  @ThrottleUpload()
  @MaxFileSize(undefined, 2) // 2MB para foto de perfil
  @Patch('/:id')
  @UseInterceptors(FileInterceptor('photo'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @UploadedFile() photo: Express.Multer.File,
    @UserId() userId: string,
    @Req() req: any,
  ) {
    // Proteção contra IDOR: Passa informações do usuário autenticado
    const userRole = req.user?.role;
    await this.updateUserUseCase.execute(id, dto, photo, userId, userRole);
  }

  @Roles('admin')
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.deleteUserUseCase.execute(id);
  }
}
