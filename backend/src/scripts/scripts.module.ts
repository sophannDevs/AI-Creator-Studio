import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AiScriptsController } from './ai-scripts.controller';
import { ScriptsController } from './scripts.controller';
import { ScriptsService } from './scripts.service';

@Module({
  imports: [AiModule],
  controllers: [AiScriptsController, ScriptsController],
  providers: [ScriptsService],
})
export class ScriptsModule {}
