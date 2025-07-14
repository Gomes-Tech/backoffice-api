import {
  CreateAttributeUseCase,
  DeleteAttributeUseCase,
  FindAllAttributeUseCase,
  FindAttributeByIdUseCase,
  FindAttributeByNameUseCase,
  UpdateAttributeUseCase,
} from '@app/attribute';
import { PrismaAttributeRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { AttributeController } from '../controllers';

@Module({
  imports: [],
  controllers: [AttributeController],
  providers: [
    FindAllAttributeUseCase,
    FindAttributeByIdUseCase,
    FindAttributeByNameUseCase,
    CreateAttributeUseCase,
    UpdateAttributeUseCase,
    DeleteAttributeUseCase,
    PrismaAttributeRepository,
    {
      provide: 'AttributeRepository',
      useExisting: PrismaAttributeRepository,
    },
  ],
  exports: [
    {
      provide: 'AttributeRepository',
      useExisting: PrismaAttributeRepository,
    },
  ],
})
export class AttributeModule {}
