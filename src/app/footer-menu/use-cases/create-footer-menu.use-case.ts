import { FooterMenuRepository } from '@domain/footer-menu';
import { CacheService } from '@infra/cache';
import { StorageService } from '@infra/providers';
import { CreateFooterMenuDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateFooterMenuUseCase {
  constructor(
    @Inject('FooterMenuRepository')
    private readonly footerMenuRepository: FooterMenuRepository,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
  ) {}

  async execute(
    dto: CreateFooterMenuDTO,
    userId: string,
    files: Express.Multer.File[],
  ): Promise<void> {
    const imageItems: any =
      dto.items?.filter((item) => item.type === 'IMAGE') ?? [];

    if (files.length > 0 && imageItems.length > 0) {
      const uploadPromises = imageItems.map(async (item, index) => {
        const file = files[index];

        try {
          const result = await this.storageService.uploadFile(
            'product-images',
            file.originalname,
            file.buffer,
          );

          if (result && result.publicUrl) {
            item.imageUrl = result.publicUrl;
            item.imageKey = result.path;
          } else {
            console.log(
              `Upload retornou resultado inválido para arquivo ${file.originalname}`,
            );
          }
        } catch (err) {
          console.log(
            `Erro ao fazer upload do arquivo ${file.originalname}`,
            err,
          );
        }
      });

      await Promise.all(uploadPromises);
    }

    const itemsWithId =
      dto.items?.map((item) => ({
        id: uuidv4(),
        ...item,
      })) ?? [];

    await this.footerMenuRepository.create({
      id: uuidv4(),
      name: dto.name,
      isActive: dto.isActive,
      items: itemsWithId,
      createdBy: userId,
    });

    await this.cacheService.del('footer-menu');
  }
}
