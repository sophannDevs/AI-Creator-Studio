import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER_TOKEN } from './providers/ai-provider.token';
import type { AiProvider } from './providers/ai-provider.interface';
import {
  buildScriptPrompt,
  buildSeoPrompt,
  buildThumbnailPrompt,
  buildVideoIdeaPrompt,
} from './prompts/prompt-templates';
import {
  ScriptGenerationInput,
  SeoGenerationInput,
  ThumbnailPromptGenerationInput,
  VideoIdeaGenerationInput,
} from './types/ai-inputs';
import {
  ScriptGenerationResult,
  SeoGenerationResult,
  ThumbnailPromptGenerationResult,
  VideoIdeaGenerationResult,
} from './types/ai-outputs';

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER_TOKEN)
    private readonly provider: AiProvider,
  ) {}

  generateVideoIdeas(
    input: VideoIdeaGenerationInput,
  ): Promise<VideoIdeaGenerationResult> {
    const prompt = buildVideoIdeaPrompt(input);
    return this.provider.generateVideoIdeas(input, prompt);
  }

  generateScript(
    input: ScriptGenerationInput,
  ): Promise<ScriptGenerationResult> {
    const prompt = buildScriptPrompt(input);
    return this.provider.generateScript(input, prompt);
  }

  generateSeo(input: SeoGenerationInput): Promise<SeoGenerationResult> {
    const prompt = buildSeoPrompt(input);
    return this.provider.generateSeo(input, prompt);
  }

  generateThumbnailPrompt(
    input: ThumbnailPromptGenerationInput,
  ): Promise<ThumbnailPromptGenerationResult> {
    const prompt = buildThumbnailPrompt(input);
    return this.provider.generateThumbnailPrompt(input, prompt);
  }
}
