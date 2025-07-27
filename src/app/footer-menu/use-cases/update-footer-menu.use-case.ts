import { FooterMenuRepository } from '@domain/footer-menu';
import { CacheService } from '@infra/cache';
import { StorageService } from '@infra/providers';
import { UpdateFooterMenuDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FindFooterMenuByIdUseCase } from './find-footer-menu-by-id.use-case';

@Injectable()
export class UpdateFooterMenuUseCase {
  constructor(
    @Inject('FooterMenuRepository')
    private readonly footerMenuRepository: FooterMenuRepository,
    private readonly findFooterMenuByIdUseCase: FindFooterMenuByIdUseCase,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
  ) {}

  async execute(
    id: string,
    dto: UpdateFooterMenuDTO,
    files: Express.Multer.File[],
    userId: string,
  ): Promise<void> {
    await this.findFooterMenuByIdUseCase.execute(id);

    const imageItemsToUpload: any =
      dto.items?.filter((item) => item.type === 'IMAGE' && !item.imageUrl) ??
      [];

    // Upload paralelo das imagens novas
    if (files.length > 0 && imageItemsToUpload.length > 0) {
      await Promise.all(
        imageItemsToUpload.map(async (item, index) => {
          const file = files[index];
          if (!file) {
            console.log(
              `Arquivo não encontrado para item IMAGE no índice ${index}`,
            );
            return;
          }
          try {
            const result = await this.storageService.uploadFile(
              'footer-menus',
              file.originalname,
              file.buffer,
            );
            if (result?.publicUrl) {
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
        }),
      );
    }

    const newItems = (dto.items ?? [])
      .filter((item) => !item.id)
      .map((item) => ({
        id: uuidv4(),
        ...item,
        type: item.type!,
      }));

    const updatedItems = (dto.items ?? [])
      .filter(
        (item): item is { id: string } & typeof item =>
          typeof item.id === 'string' && item.id.trim() !== '',
      )
      .map((item) => ({
        ...item,
        type: item.type!,
        id: item.id!,
      }));

    const finalItems = [...updatedItems, ...newItems];

    const updatePayload = {
      name: dto.name,
      isActive: dto.isActive,
      items: finalItems,
      updatedBy: userId,
    };

    await this.footerMenuRepository.update(id, updatePayload, userId);

    await this.cacheService.del('footer-menu');
  }
}
