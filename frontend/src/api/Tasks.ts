import apiClient from "./client";

export interface TaskResponse{
    id :number;
    project: Project;
    title: string;
    description:string;
    status:string;
    assigned_to:number;
    created_by:string;
    created_at:string;
    updated_at:string;
}

export interface Project {
    id:number;
    name:string;
}

export interface FetchTasksResponse{
    mytasks: TaskResponse[];
}

export async function fetchTasks(id:number): Promise<FetchTasksResponse>{
    const response = await apiClient.get<FetchTasksResponse>(`/tasks/${id}`);
    return response.data;
}