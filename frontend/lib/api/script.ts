import { apiRequest, withAuthHeaders } from './client';

export type ScriptResponse = {
  id: string;
  hook: string;
  intro: string;
  mainContent: string;
  conclusion: string;
  cta: string;
  duration: string | null;
  tone: string | null;
};

export type GenerateScriptPayload = {
  videoIdeaId: string;
  duration: string;
  tone: string;
  language: string;
};

export async function generateScript(
  token: string,
  payload: GenerateScriptPayload,
): Promise<ScriptResponse> {
  return apiRequest<ScriptResponse>('/ai/script', {
    method: 'POST',
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function getScriptByIdeaId(
  token: string,
  ideaId: string,
): Promise<ScriptResponse> {
  return apiRequest<ScriptResponse>(`/video-ideas/${ideaId}/script`, {
    method: 'GET',
    headers: withAuthHeaders(token),
  });
}
