import {
  ApplyCouponUseCase,
  CreateCartItemUseCase,
  CreateCartUseCase,
  DeleteCartItemUseCase,
  DeleteCartUseCase,
  FindCartByCustomerIdUseCase,
  RemoveCouponUseCase,
  SyncCartUseCase,
  UpdateCartItemUseCase,
} from '@app/cart';
import { AuthType, CustomerId } from '@interfaces/http/decorators';
import {
  ApplyCouponDTO,
  CreateCartItemDTO,
  SyncCartDTO,
  UpdateCartItemDTO,
} from '@interfaces/http/dtos';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

@AuthType(['customer'])
@Controller('cart')
export class CartController {
  constructor(
    private readonly syncCartUseCase: SyncCartUseCase,
    private readonly findCartByCustomerIdUseCase: FindCartByCustomerIdUseCase,
    private readonly createCartItemUseCase: CreateCartItemUseCase,
    private readonly createCartUseCase: CreateCartUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
    private readonly deleteCartItemUseCase: DeleteCartItemUseCase,
    private readonly deleteCartUseCase: DeleteCartUseCase,
    private readonly applyCouponUseCase: ApplyCouponUseCase,
    private readonly removeCouponUseCase: RemoveCouponUseCase,
  ) {}

  @Get()
  async findCartByCustomerId(@CustomerId() customerId: string) {
    return await this.findCartByCustomerIdUseCase.execute(customerId);
  }

  @Post('/sync')
  async syncCart(@CustomerId() customerId: string, @Body() dto: SyncCartDTO) {
    return await this.syncCartUseCase.execute(customerId, dto.items);
  }

  @Post()
  async createCart(@CustomerId() customerId: string) {
    return await this.createCartUseCase.execute(customerId);
  }

  @Post('/items')
  async createCartItem(@Body() dto: CreateCartItemDTO) {
    return await this.createCartItemUseCase.execute(
      dto.cartId,
      dto.productVariantId,
      dto.quantity,
    );
  }

  @Post('/apply-coupon')
  async applyCoupon(
    @CustomerId() customerId: string,
    @Body() dto: ApplyCouponDTO,
  ) {
    return await this.applyCouponUseCase.execute(customerId, dto.code);
  }

  @Patch('/items/:id')
  async updateCartItem(
    @Param('id') cartItemId: string,
    @Body() dto: UpdateCartItemDTO,
  ) {
    return await this.updateCartItemUseCase.execute(cartItemId, dto.quantity);
  }

  @Delete('/items/:id')
  async deleteCartItem(@Param('id') cartItemId: string) {
    return await this.deleteCartItemUseCase.execute(cartItemId);
  }

  @Delete()
  async deleteCart(@CustomerId() customerId: string) {
    return await this.deleteCartUseCase.execute(customerId);
  }

  @Delete('/remove-coupon')
  async removeCoupon(@CustomerId() customerId: string) {
    return await this.removeCouponUseCase.execute(customerId);
  }
}
