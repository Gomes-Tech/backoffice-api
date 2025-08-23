import {
  CreateAttributeValueUseCase,
  DeleteAttributeValueUseCase,
  FindAllAttributeValueByAttributeUseCase,
  FindAllAttributeValueUseCase,
  FindAttributeValueByIdUseCase,
  FindAttributeValueByIdWithAttributeUseCase,
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
    FindAllAttributeValueUseCase,
    FindAllAttributeValueByAttributeUseCase,
    FindAttributeValueByIdWithAttributeUseCase,
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
    FindAttributeValueByIdWithAttributeUseCase,
    {
      provide: 'AttributeValueRepository',
      useExisting: PrismaAttributeValueRepository,
    },
  ],
})
export class AttributeValueModule {}
