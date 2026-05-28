import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AiThumbnailsController } from './ai-thumbnails.controller';
import { ThumbnailsController } from './thumbnails.controller';
import { ThumbnailsService } from './thumbnails.service';

@Module({
  imports: [AiModule],
  controllers: [AiThumbnailsController, ThumbnailsController],
  providers: [ThumbnailsService],
})
export class ThumbnailsModule {}
