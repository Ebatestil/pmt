import apiClient from "./client";

export interface TaskResponse {
  id: number;
  project: Project;
  title: string;
  description: string;
  status: string;
  assigned_to: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
}

export interface FetchTasksResponse {
  mytasks: TaskResponse[];
}

export async function fetchTasks(id: number): Promise<FetchTasksResponse> {
  const response = await apiClient.get<FetchTasksResponse>(`/tasks/${id}`);
  return response.data;
}

export async function fetchProjectProgress(projectId: number): Promise<number> {
  const response = await apiClient.get<{ progress: number }>(`/projects/${projectId}/tasks`);
  return response.data.progress;
}

export async function updateMyTaskStatus(
  projectId: number,
  taskId: number,
  status: "todo" | "in_progress" | "done"
): Promise<{ task: TaskResponse; progress: number }> {
  const response = await apiClient.patch<{ task: TaskResponse; progress: number }>(
    `/projects/${projectId}/tasks/${taskId}/status`,
    { status }
  );
  return response.data;
}