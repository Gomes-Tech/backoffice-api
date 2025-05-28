import { UploadFileException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
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
    filename: string,
    fileContent: Buffer,
  ): Promise<{
    id: string;
    path: string;
    fullPath: string;
    publicUrl: string;
  }> {
    const { data, error } = await this.supabase.storage
      .from('sobramais')
      .upload(`comprovantes/${Date.now()}-${filename}`, fileContent);

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
    const { data } = this.supabase.storage.from('sobramais').getPublicUrl(path);

    return data;
  }
}
