export type VideoIdeaGenerationInput = {
  projectName: string;
  niche: string;
  language: string;
  targetAudience: string;
  description?: string;
  tone?: string;
  count?: number;
};

export type ScriptGenerationInput = {
  projectName: string;
  niche: string;
  language: string;
  targetAudience: string;
  title: string;
  hook?: string;
  duration?: string;
  tone?: string;
};

export type SeoGenerationInput = {
  projectName: string;
  niche: string;
  language: string;
  targetAudience: string;
  title: string;
  summary?: string;
  targetKeyword?: string;
};

export type ThumbnailPromptGenerationInput = {
  projectName: string;
  niche: string;
  language: string;
  targetAudience: string;
  title: string;
  hook?: string;
  requestedStyle?: string;
};
