import {
  ScriptGenerationInput,
  SeoGenerationInput,
  ThumbnailPromptGenerationInput,
  VideoIdeaGenerationInput,
} from '../types/ai-inputs';
import {
  ScriptGenerationResult,
  SeoGenerationResult,
  ThumbnailPromptGenerationResult,
  VideoIdeaGenerationResult,
} from '../types/ai-outputs';

export interface AiProvider {
  generateVideoIdeas(
    input: VideoIdeaGenerationInput,
    prompt: string,
  ): Promise<VideoIdeaGenerationResult>;

  generateScript(
    input: ScriptGenerationInput,
    prompt: string,
  ): Promise<ScriptGenerationResult>;

  generateSeo(
    input: SeoGenerationInput,
    prompt: string,
  ): Promise<SeoGenerationResult>;

  generateThumbnailPrompt(
    input: ThumbnailPromptGenerationInput,
    prompt: string,
  ): Promise<ThumbnailPromptGenerationResult>;
}
