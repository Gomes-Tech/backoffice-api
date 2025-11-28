import {
  CreateWishlistItemUseCase,
  FindWishlistByCustomerIdUseCase,
  RemoveWishlistItemUseCase,
} from '@app/wishlist';
import { AuthType, CustomerId } from '@interfaces/http/decorators';
import { AddWishlistItemDTO } from '@interfaces/http/dtos';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';

@AuthType(['customer'])
@Controller('wishlist')
export class WishlistController {
  constructor(
    private readonly findWishlistByCustomerIdUseCase: FindWishlistByCustomerIdUseCase,
    private readonly createWishlistItemUseCase: CreateWishlistItemUseCase,
    private readonly removeWishlistItemUseCase: RemoveWishlistItemUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findWishlistByCustomerId(@CustomerId() customerId: string) {
    return await this.findWishlistByCustomerIdUseCase.execute(customerId);
  }

  @Post('/items')
  @HttpCode(HttpStatus.CREATED)
  async createWishlistItem(
    @Body() dto: AddWishlistItemDTO,
    @CustomerId() customerId: string,
  ) {
    return await this.createWishlistItemUseCase.execute(
      dto.productId,
      dto.wishlistId,
      customerId,
    );
  }

  @Delete('/items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeWishlistItem(@Param('id') wishlistItemId: string) {
    return await this.removeWishlistItemUseCase.execute(wishlistItemId);
  }
}
