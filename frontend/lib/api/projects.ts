import { apiRequest, withAuthHeaders } from './client';

export type Project = {
  id: string;
  userId: string;
  name: string;
  niche: string;
  language: string;
  targetAudience: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectPayload = {
  name: string;
  niche: string;
  language: string;
  targetAudience: string;
  description?: string;
};

export type UpdateProjectPayload = {
  name?: string;
  niche?: string;
  language?: string;
  targetAudience?: string;
  description?: string | null;
};

export async function listProjects(token: string): Promise<Project[]> {
  return apiRequest<Project[]>('/projects', {
    method: 'GET',
    headers: withAuthHeaders(token),
  });
}

export async function createProject(
  token: string,
  payload: CreateProjectPayload,
): Promise<Project> {
  return apiRequest<Project>('/projects', {
    method: 'POST',
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function getProject(token: string, id: string): Promise<Project> {
  return apiRequest<Project>(`/projects/${id}`, {
    method: 'GET',
    headers: withAuthHeaders(token),
  });
}

export async function updateProject(
  token: string,
  id: string,
  payload: UpdateProjectPayload,
): Promise<Project> {
  return apiRequest<Project>(`/projects/${id}`, {
    method: 'PATCH',
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteProject(token: string, id: string): Promise<void> {
  await apiRequest<unknown>(`/projects/${id}`, {
    method: 'DELETE',
    headers: withAuthHeaders(token),
  });
}
