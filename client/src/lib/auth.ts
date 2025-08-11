import { apiRequest } from "@/lib/queryClient";

export async function loginUser(email: string, password: string) {
  const response = await apiRequest("POST", "/api/auth/login", { email, password });
  return response.json();
}

export async function registerUser(userData: any) {
  const response = await apiRequest("POST", "/api/auth/register", userData);
  return response.json();
}

export async function getCurrentUser(token: string) {
  const response = await fetch("/api/auth/me", {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  
  return response.json();
}
