import { apiRequest, withAuthHeaders } from './client';

export type SeoResponse = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  seoScore: number;
};

export type GenerateSeoPayload = {
  videoIdeaId: string;
  targetKeyword: string;
};

export async function generateSeo(
  token: string,
  payload: GenerateSeoPayload,
): Promise<SeoResponse> {
  return apiRequest<SeoResponse>('/ai/seo', {
    method: 'POST',
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function getSeoByIdeaId(
  token: string,
  ideaId: string,
): Promise<SeoResponse> {
  return apiRequest<SeoResponse>(`/video-ideas/${ideaId}/seo`, {
    method: 'GET',
    headers: withAuthHeaders(token),
  });
}
