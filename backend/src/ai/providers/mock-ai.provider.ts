import { Injectable } from '@nestjs/common';
import { AiProvider } from './ai-provider.interface';
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

@Injectable()
export class MockAiProvider implements AiProvider {
  generateVideoIdeas(
    input: VideoIdeaGenerationInput,
    prompt: string,
  ): Promise<VideoIdeaGenerationResult> {
    const count = Math.max(1, Math.min(input.count ?? 5, 10));
    const topics = [
      'beginner mistakes',
      'production workflow',
      'case study',
      'tool comparison',
      'step-by-step framework',
      'myth busting',
      'career roadmap',
      'checklist tutorial',
      'debugging walkthrough',
      'project teardown',
    ];
    const verbs = [
      'Master',
      'Fix',
      'Build',
      'Ship',
      'Scale',
      'Avoid',
      'Upgrade',
    ];

    const base = stableSeed(
      [
        input.projectName,
        input.niche,
        input.language,
        input.targetAudience,
        prompt,
      ].join('|'),
    );

    const ideas = Array.from({ length: count }, (_, index) => {
      const topic = topics[(base + index * 3) % topics.length];
      const verb = verbs[(base + index * 5) % verbs.length];
      const title = `${verb} ${toTitleCase(input.niche)}: ${toTitleCase(topic)} for ${input.targetAudience}`;
      const hook = `If you're struggling with ${topic}, this ${input.language} breakdown shows the exact playbook creators use to get results faster.`;

      return {
        title,
        hook,
        status: 'DRAFT' as const,
      };
    });

    return Promise.resolve({ ideas });
  }

  generateScript(
    input: ScriptGenerationInput,
    prompt: string,
  ): Promise<ScriptGenerationResult> {
    const seed = stableSeed(
      [
        input.projectName,
        input.niche,
        input.language,
        input.title,
        prompt,
      ].join('|'),
    );

    const tones = ['Educational', 'Confident', 'Conversational', 'Practical'];
    const durations = ['45-60 seconds', '60-75 seconds', '75-90 seconds'];
    const tone = input.tone?.trim() || tones[seed % tones.length];
    const duration =
      input.duration?.trim() || durations[seed % durations.length];

    const hook =
      input.hook?.trim() ||
      `Most creators in ${input.niche} waste months on the wrong tactic; let's fix that in under a minute.`;

    return Promise.resolve({
      hook,
      intro: `Today we break down "${input.title}" for ${input.targetAudience}, with a clear approach you can apply immediately.`,
      mainContent:
        'Step 1: set one measurable goal. Step 2: use a repeatable process instead of random effort. Step 3: review what performed and double down on the winning pattern.',
      conclusion: `Consistency plus fast feedback is what compounds growth, especially in ${input.niche}.`,
      cta: 'Follow for more creator systems and comment your niche for a custom breakdown.',
      duration,
      tone,
    });
  }

  generateSeo(
    input: SeoGenerationInput,
    prompt: string,
  ): Promise<SeoGenerationResult> {
    const keyword = input.targetKeyword?.trim();
    const seed = stableSeed(
      [
        input.projectName,
        input.niche,
        input.language,
        input.title,
        input.summary ?? '',
        keyword ?? '',
        prompt,
      ].join('|'),
    );

    const seoTitle = keyword
      ? `${keyword} | ${input.title} | ${toTitleCase(input.niche)} Guide`
      : `${input.title} | ${toTitleCase(input.niche)} Guide for ${input.targetAudience}`;
    const description = input.summary?.trim()
      ? input.summary.trim()
      : keyword
        ? `Learn ${keyword} in ${input.language} with a practical ${input.niche} framework tailored to ${input.targetAudience}.`
        : `Learn a practical ${input.niche} strategy in ${input.language} with clear steps built for ${input.targetAudience}.`;

    const tags = [
      sanitizeTag(input.niche),
      sanitizeTag(input.targetAudience),
      'youtube growth',
      'content strategy',
      'creator tips',
    ];
    if (keyword) {
      tags.unshift(sanitizeTag(keyword));
    }

    const hashtags = [
      `#${toCamelHash(input.niche)}`,
      '#YouTubeTips',
      '#ContentCreator',
      '#AudienceGrowth',
      `#${toCamelHash(input.language)}`,
    ];
    if (keyword) {
      hashtags.unshift(`#${toCamelHash(keyword)}`);
    }

    return Promise.resolve({
      title: seoTitle,
      description,
      tags,
      hashtags,
      seoScore: 82 + (seed % 13),
    });
  }

  generateThumbnailPrompt(
    input: ThumbnailPromptGenerationInput,
    prompt: string,
  ): Promise<ThumbnailPromptGenerationResult> {
    const requestedStyle = input.requestedStyle?.trim();
    const seed = stableSeed(
      [
        input.projectName,
        input.niche,
        input.title,
        input.hook ?? '',
        requestedStyle ?? '',
        prompt,
      ].join('|'),
    );

    const styles = [
      'high-contrast cinematic',
      'clean modern infographic',
      'bold creator-face reaction',
      'minimalist pro tutorial look',
    ];
    const suggestedStyle = styles[seed % styles.length];
    const style = requestedStyle
      ? `${requestedStyle} + ${suggestedStyle}`
      : suggestedStyle;

    const text = truncateWords(input.title, 5).toUpperCase();
    const backgroundIdea = `${toTitleCase(input.niche)} workspace with dynamic lighting and visual depth.`;
    const mainObject = `Creator pointing at a highlighted ${toTitleCase(input.niche)} performance chart.`;
    const generatedPrompt = `YouTube thumbnail, ${style}, ${backgroundIdea} Main subject: ${mainObject} Overlay text: "${text}". Designed for ${input.targetAudience}, clear focal point, strong contrast, readable at small size.`;

    return Promise.resolve({
      text,
      backgroundIdea,
      mainObject,
      style,
      prompt: generatedPrompt,
    });
  }
}

function stableSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}`)
    .join(' ');
}

function sanitizeTag(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim();
}

function toCamelHash(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      return `${lower[0]?.toUpperCase() ?? ''}${lower.slice(1)}`;
    })
    .join('');
}

function truncateWords(value: string, maxWords: number): string {
  return value.split(/\s+/).filter(Boolean).slice(0, maxWords).join(' ');
}
