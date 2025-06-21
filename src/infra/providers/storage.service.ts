import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase';

@Injectable()
export class StorageService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async uploadFile(
    folder: string,
    filename: string,
    fileContent: Buffer,
  ): Promise<{
    id: string;
    path: string;
    fullPath: string;
    publicUrl: string;
  }> {
    return await this.supabaseService.uploadFile(folder, filename, fileContent);
  }

  getPublicUrl(path: string) {
    return this.supabaseService.getPublicUrl(path);
  }
}
