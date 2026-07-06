import apiClient from "./client";

export interface CreateProjectPayload {
  name: string;
  description?: string;
  status?: "active" | "completed" | "on_hold";
}

export interface ProjectOwner {  
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface ProjectMember {
  id: number;
  name: string;
  email: string;
  pivot: {
    role: "manager" | "member";
  };
}

export interface ProjectResponse {
  id: number;
  name: string;
  description: string | null;
  status: "active" | "completed" | "on_hold";
  owner_id: number;
  owner: ProjectOwner;
  members_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends ProjectResponse {
  members: ProjectMember[];
}

export interface FetchProjectsResponse {
  owned: ProjectResponse[];
  shared: ProjectResponse[];
}

export async function fetchProjects(): Promise<FetchProjectsResponse> {
  const response = await apiClient.get<FetchProjectsResponse>("/projects");
  return response.data;
}

export async function fetchProject(id: number): Promise<ProjectDetail> {
  const response = await apiClient.get<{ project: ProjectDetail }>(`/projects/${id}`);
  return response.data.project;
}

export async function createProject(payload: CreateProjectPayload): Promise<ProjectResponse> {
  const response = await apiClient.post<{ project: ProjectResponse }>("/projects", payload);
  return response.data.project;
}

export interface AddMemberPayload {
  user_id: number;
  role: "manager" | "member";
}

export interface AddMemberResponse {
  message: string;
  members: ProjectMember[];
}

export async function addMember(projectId: number, payload: AddMemberPayload): Promise<AddMemberResponse> {
  const response = await apiClient.post<AddMemberResponse>(
    `/projects/${projectId}/members`,
    payload
  );
  return response.data;
}

// ===== Tasks =====

export interface TaskUser {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  assigned_to: number;
  created_by: number;
  assignee: TaskUser;
  creator: TaskUser;
  created_at: string;
  updated_at: string;
}

export interface FetchTasksResponse {
  tasks: Task[];
  progress: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  assigned_to: number;
}

export interface UpdateTaskStatusPayload {
  status: "todo" | "in_progress" | "done";
}

export async function fetchTasks(projectId: number): Promise<FetchTasksResponse> {
  const response = await apiClient.get<FetchTasksResponse>(`/projects/${projectId}/tasks`);
  return response.data;
}

export async function createTask(projectId: number, payload: CreateTaskPayload): Promise<Task> {
  const response = await apiClient.post<{ task: Task }>(`/projects/${projectId}/tasks`, payload);
  return response.data.task;
}

export async function updateTaskStatus(
  projectId: number,
  taskId: number,
  payload: UpdateTaskStatusPayload
): Promise<{ task: Task; progress: number }> {
  const response = await apiClient.patch<{ task: Task; progress: number }>(
    `/projects/${projectId}/tasks/${taskId}/status`,
    payload
  );
  return response.data;
}