import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { VideoIdeasController } from './video-ideas.controller';
import { VideoIdeasService } from './video-ideas.service';

@Module({
  imports: [AiModule],
  controllers: [VideoIdeasController],
  providers: [VideoIdeasService],
})
export class VideoIdeasModule {}
