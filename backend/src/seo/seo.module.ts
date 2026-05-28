import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AiSeoController } from './ai-seo.controller';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';

@Module({
  imports: [AiModule],
  controllers: [AiSeoController, SeoController],
  providers: [SeoService],
})
export class SeoModule {}
