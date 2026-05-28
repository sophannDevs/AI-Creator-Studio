export type VideoIdea = {
  title: string;
  hook: string;
  status: 'DRAFT';
};

export type VideoIdeaGenerationResult = {
  ideas: VideoIdea[];
};

export type ScriptGenerationResult = {
  hook: string;
  intro: string;
  mainContent: string;
  conclusion: string;
  cta: string;
  duration: string;
  tone: string;
};

export type SeoGenerationResult = {
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  seoScore: number;
};

export type ThumbnailPromptGenerationResult = {
  text: string;
  backgroundIdea: string;
  mainObject: string;
  style: string;
  prompt: string;
};
