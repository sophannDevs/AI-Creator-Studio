import { apiRequest, withAuthHeaders } from './client';

export type ThumbnailResponse = {
  id: string;
  text: string;
  backgroundIdea: string;
  mainObject: string;
  style: string;
  prompt: string;
};

export type GenerateThumbnailPayload = {
  videoIdeaId: string;
  style: string;
};

export async function generateThumbnail(
  token: string,
  payload: GenerateThumbnailPayload,
): Promise<ThumbnailResponse> {
  return apiRequest<ThumbnailResponse>('/ai/thumbnail', {
    method: 'POST',
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function getThumbnailByIdeaId(
  token: string,
  ideaId: string,
): Promise<ThumbnailResponse> {
  return apiRequest<ThumbnailResponse>(`/video-ideas/${ideaId}/thumbnail`, {
    method: 'GET',
    headers: withAuthHeaders(token),
  });
}
