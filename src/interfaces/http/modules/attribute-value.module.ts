import {
  CreateAttributeValueUseCase,
  DeleteAttributeValueUseCase,
  FindAllAttributeValueByAttributeUseCase,
  FindAttributeValueByIdUseCase,
  FindAttributeValueByNameUseCase,
  FindAttributeValueByValueUseCase,
  UpdateAttributeValueUseCase,
} from '@app/attribute-value';
import { PrismaAttributeValueRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { AttributeValueController } from '../controllers';

@Module({
  imports: [],
  controllers: [AttributeValueController],
  providers: [
    FindAllAttributeValueByAttributeUseCase,
    FindAttributeValueByIdUseCase,
    FindAttributeValueByNameUseCase,
    FindAttributeValueByValueUseCase,
    CreateAttributeValueUseCase,
    UpdateAttributeValueUseCase,
    DeleteAttributeValueUseCase,
    PrismaAttributeValueRepository,
    {
      provide: 'AttributeValueRepository',
      useExisting: PrismaAttributeValueRepository,
    },
  ],
  exports: [
    {
      provide: 'AttributeValueRepository',
      useExisting: PrismaAttributeValueRepository,
    },
  ],
})
export class AttributeValueModule {}
