import { UploadFileException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface StorageFile {
  id: string;
  path: string;
  fullPath: string;
  publicUrl: string;
}

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient;
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_API_KEY,
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async uploadFile(
    folder: string,
    filename: string,
    fileContent: Buffer,
  ): Promise<StorageFile> {
    const { data, error } = await this.supabase.storage
      .from('backoffice')
      .upload(`${folder}/${Date.now()}-${filename}`, fileContent);

    if (error) {
      throw new UploadFileException();
    }

    const { publicUrl } = this.getPublicUrl(data.path);

    return {
      ...data,
      publicUrl,
    };
  }

  getPublicUrl(path: string) {
    const { data } = this.supabase.storage
      .from('backoffice')
      .getPublicUrl(path);

    return data;
  }
}
