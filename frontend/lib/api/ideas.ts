import { apiRequest, withAuthHeaders } from './client';

export type VideoIdea = {
  id: string;
  projectId: string;
  title: string;
  hook: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type GenerateVideoIdeasPayload = {
  projectId: string;
  tone: string;
  count?: number;
};

export type GenerateVideoIdeasResponse = {
  ideas: Array<{
    id: string;
    title: string;
    hook: string | null;
    status: string;
  }>;
};

export async function generateVideoIdeas(
  token: string,
  payload: GenerateVideoIdeasPayload,
): Promise<GenerateVideoIdeasResponse> {
  return apiRequest<GenerateVideoIdeasResponse>('/ai/video-ideas', {
    method: 'POST',
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function listVideoIdeasByProject(
  token: string,
  projectId: string,
): Promise<VideoIdea[]> {
  return apiRequest<VideoIdea[]>(`/projects/${projectId}/video-ideas`, {
    method: 'GET',
    headers: withAuthHeaders(token),
  });
}

export async function getVideoIdeaById(
  token: string,
  projectId: string,
  ideaId: string,
): Promise<VideoIdea | null> {
  const ideas = await listVideoIdeasByProject(token, projectId);
  return ideas.find((idea) => idea.id === ideaId) ?? null;
}

export async function findVideoIdeaAcrossProjects(
  token: string,
  projectIds: string[],
  ideaId: string,
): Promise<{ idea: VideoIdea; projectId: string } | null> {
  const results = await Promise.all(
    projectIds.map(async (projectId) => {
      const found = await getVideoIdeaById(token, projectId, ideaId);
      return {
        idea: found,
        projectId,
      };
    }),
  );

  const match = results.find((result) => result.idea !== null);
  if (match?.idea) {
    return {
      idea: match.idea,
      projectId: match.projectId,
    };
  }

  return null;
}
