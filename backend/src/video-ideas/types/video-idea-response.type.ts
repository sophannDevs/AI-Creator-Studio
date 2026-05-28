export type GeneratedVideoIdeaResponse = {
  id: string;
  title: string;
  hook: string | null;
  status: string;
};

export type GenerateVideoIdeasResponse = {
  ideas: GeneratedVideoIdeaResponse[];
};
