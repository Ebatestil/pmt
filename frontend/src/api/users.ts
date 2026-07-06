import apiClient from "./client";

export interface UserSearchResult {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const response = await apiClient.get<{ users: UserSearchResult[] }>("/users/search", {
    params: { q: query },
  });
  return response.data.users;
}