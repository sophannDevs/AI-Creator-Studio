import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import OpenAI, { APIConnectionTimeoutError } from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { AiProvider } from './ai-provider.interface';
import {
  scriptOutputSchema,
  seoOutputSchema,
  thumbnailOutputSchema,
  videoIdeasOutputSchema,
} from './openai-output.schemas';
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

const DEFAULT_MODEL = 'gpt-5.4-mini';
const DEFAULT_TIMEOUT_MS = 30_000;
const SAFE_AI_ERROR =
  'AI generation is temporarily unavailable. Please try again in a moment or switch AI_PROVIDER=mock for local development.';
const MISSING_KEY_ERROR =
  'OpenAI provider is not configured. Set OPENAI_API_KEY or use AI_PROVIDER=mock.';

@Injectable()
export class OpenAiProvider implements AiProvider {
  private client?: OpenAI;

  async generateVideoIdeas(
    input: VideoIdeaGenerationInput,
    prompt: string,
  ): Promise<VideoIdeaGenerationResult> {
    const result = await this.generateStructured(
      videoIdeasOutputSchema,
      'video_ideas',
      prompt,
      `Return exactly ${Math.max(1, Math.min(input.count ?? 5, 10))} ideas. Each status must be DRAFT.`,
    );

    return result;
  }

  async generateScript(
    _input: ScriptGenerationInput,
    prompt: string,
  ): Promise<ScriptGenerationResult> {
    return this.generateStructured(
      scriptOutputSchema,
      'script',
      prompt,
      'Write concise YouTube script copy. Keep each field useful and production-ready.',
    );
  }

  async generateSeo(
    _input: SeoGenerationInput,
    prompt: string,
  ): Promise<SeoGenerationResult> {
    return this.generateStructured(
      seoOutputSchema,
      'seo_metadata',
      prompt,
      'Create YouTube SEO metadata. tags and hashtags must be arrays. seoScore must be 0 to 100.',
    );
  }

  async generateThumbnailPrompt(
    _input: ThumbnailPromptGenerationInput,
    prompt: string,
  ): Promise<ThumbnailPromptGenerationResult> {
    return this.generateStructured(
      thumbnailOutputSchema,
      'thumbnail_prompt',
      prompt,
      'Create thumbnail prompt details only. Do not claim an image was generated.',
    );
  }

  private async generateStructured<T extends z.ZodType>(
    schema: T,
    schemaName: string,
    prompt: string,
    taskInstruction: string,
  ): Promise<z.infer<T>> {
    const client = this.getClient();

    try {
      const response = await client.responses.parse({
        model: this.getModel(),
        input: [
          {
            role: 'system',
            content: [
              'You are the AI engine for AI Creator Studio.',
              'Return only structured data matching the requested schema.',
              'Keep content practical, specific, and safe for YouTube creators.',
              taskInstruction,
            ].join(' '),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        text: {
          format: zodTextFormat(schema, schemaName),
          verbosity: 'low',
        },
      });

      const parsed = response.output_parsed;
      if (!parsed) {
        throw new Error('OpenAI response did not include parsed output.');
      }

      return schema.parse(parsed);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      if (error instanceof APIConnectionTimeoutError) {
        throw new ServiceUnavailableException(SAFE_AI_ERROR);
      }

      if (error instanceof z.ZodError) {
        throw new ServiceUnavailableException(SAFE_AI_ERROR);
      }

      throw new ServiceUnavailableException(SAFE_AI_ERROR);
    }
  }

  private getClient(): OpenAI {
    if (this.client) {
      return this.client;
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException(MISSING_KEY_ERROR);
    }

    this.client = new OpenAI({
      apiKey,
      timeout: this.getTimeoutMs(),
      maxRetries: 0,
    });

    return this.client;
  }

  private getModel(): string {
    return process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  }

  private getTimeoutMs(): number {
    const configured = Number(process.env.OPENAI_TIMEOUT_MS);
    return Number.isFinite(configured) && configured > 0
      ? configured
      : DEFAULT_TIMEOUT_MS;
  }
}
