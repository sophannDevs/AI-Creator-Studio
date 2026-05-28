import {
  ScriptGenerationInput,
  SeoGenerationInput,
  ThumbnailPromptGenerationInput,
  VideoIdeaGenerationInput,
} from '../types/ai-inputs';

export function buildVideoIdeaPrompt(input: VideoIdeaGenerationInput): string {
  const count = input.count ?? 5;
  const descriptionLine = input.description
    ? `Project context: ${input.description}`
    : 'Project context: no additional description provided.';
  const toneLine = input.tone
    ? `Requested tone: ${input.tone}`
    : 'Requested tone: practical and beginner friendly.';

  return [
    'Generate YouTube video ideas for a creator project.',
    `Project: ${input.projectName}`,
    `Niche: ${input.niche}`,
    `Language: ${input.language}`,
    `Target audience: ${input.targetAudience}`,
    descriptionLine,
    toneLine,
    `Return ${count} practical ideas with a compelling title and opening hook.`,
  ].join('\n');
}

export function buildScriptPrompt(input: ScriptGenerationInput): string {
  const optionalHook = input.hook
    ? `Existing hook to evolve: ${input.hook}`
    : 'No existing hook provided.';
  const durationLine = input.duration
    ? `Requested duration: ${input.duration}`
    : 'Requested duration: 60-90 seconds.';
  const toneLine = input.tone
    ? `Requested tone: ${input.tone}`
    : 'Requested tone: educational and practical.';

  return [
    'Generate a short-form video script.',
    `Project: ${input.projectName}`,
    `Niche: ${input.niche}`,
    `Language: ${input.language}`,
    `Target audience: ${input.targetAudience}`,
    `Video title: ${input.title}`,
    optionalHook,
    durationLine,
    toneLine,
    'Return: hook, intro, main content, conclusion, CTA, duration, and tone.',
  ].join('\n');
}

export function buildSeoPrompt(input: SeoGenerationInput): string {
  const optionalSummary = input.summary
    ? `Summary context: ${input.summary}`
    : 'Summary context: none provided.';
  const keywordLine = input.targetKeyword
    ? `Target keyword: ${input.targetKeyword}`
    : 'Target keyword: none provided.';

  return [
    'Generate SEO metadata for a YouTube video.',
    `Project: ${input.projectName}`,
    `Niche: ${input.niche}`,
    `Language: ${input.language}`,
    `Target audience: ${input.targetAudience}`,
    `Video title: ${input.title}`,
    optionalSummary,
    keywordLine,
    'Return: SEO title, description, tags, hashtags, and a score from 0 to 100.',
  ].join('\n');
}

export function buildThumbnailPrompt(
  input: ThumbnailPromptGenerationInput,
): string {
  const optionalHook = input.hook
    ? `Hook angle: ${input.hook}`
    : 'Hook angle: use the core title promise.';
  const styleLine = input.requestedStyle
    ? `Requested style: ${input.requestedStyle}`
    : 'Requested style: platform-optimized YouTube thumbnail look.';

  return [
    'Generate a thumbnail concept prompt for a YouTube video.',
    `Project: ${input.projectName}`,
    `Niche: ${input.niche}`,
    `Language: ${input.language}`,
    `Target audience: ${input.targetAudience}`,
    `Video title: ${input.title}`,
    optionalHook,
    styleLine,
    'Return: thumbnail text, background idea, main object, style, and final AI image prompt.',
  ].join('\n');
}
