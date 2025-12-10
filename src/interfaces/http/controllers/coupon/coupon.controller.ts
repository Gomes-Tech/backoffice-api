import {
  CreateCouponUseCase,
  DeleteCouponUseCase,
  FindAllCouponUseCase,
  FindCouponByIdUseCase,
  UpdateCouponUseCase,
} from '@app/coupon';
import { AuthType, Roles, UserId } from '@interfaces/http/decorators';
import { CreateCouponDTO, UpdateCouponDTO } from '@interfaces/http/dtos';
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
@Controller('coupons')
export class CouponController {
  constructor(
    private readonly findAllCouponUseCase: FindAllCouponUseCase,
    private readonly findCouponByIdUseCase: FindCouponByIdUseCase,
    private readonly createCouponUseCase: CreateCouponUseCase,
    private readonly updateCouponUseCase: UpdateCouponUseCase,
    private readonly deleteCouponUseCase: DeleteCouponUseCase,
  ) {}

  @Roles('admin')
  @Get()
  async getAll() {
    return await this.findAllCouponUseCase.execute();
  }

  @Roles('admin')
  @Get('/:id')
  async getById(@Param('id') id: string) {
    return await this.findCouponByIdUseCase.execute(id);
  }

  @Roles('admin')
  @Post()
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCouponDTO, @UserId() userId: string) {
    return await this.createCouponUseCase.execute({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      createdBy: userId,
    });
  }

  @Roles('admin')
  @Patch('/:id')
  @UsePipes(ValidationPipe)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDTO,
    @UserId() userId: string,
  ) {
    return await this.updateCouponUseCase.execute(id, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate:
        dto.endDate !== undefined
          ? dto.endDate === null
            ? null
            : new Date(dto.endDate)
          : undefined,
      updatedBy: userId,
    });
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    await this.deleteCouponUseCase.execute(id, userId);
  }
}
