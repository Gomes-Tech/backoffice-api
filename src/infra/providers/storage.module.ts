import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { SupabaseService } from './supabase';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [StorageService, SupabaseService],
  exports: [StorageService],
})
export class StorageModule {}
