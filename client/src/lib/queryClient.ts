import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const errorData = await res.json();
      // Extract just the message without status codes
      const message = errorData.message || res.statusText;
      throw new Error(message);
    } catch (parseError) {
      // If JSON parsing fails, try text
      try {
        const text = await res.text();
        throw new Error(text || res.statusText);
      } catch {
        // Fallback to generic message based on status
        const userFriendlyMessage = getFriendlyErrorMessage(res.status);
        throw new Error(userFriendlyMessage);
      }
    }
  }
}

function getFriendlyErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Please check your information and try again";
    case 401:
      return "Invalid credentials";
    case 403:
      return "You don't have permission to access this";
    case 404:
      return "The requested information could not be found";
    case 409:
      return "This information already exists";
    case 500:
      return "Something went wrong. Please try again later";
    default:
      return "Something went wrong. Please try again";
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get token from localStorage
  const token = localStorage.getItem("auth_token");
  
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get token from localStorage for queries
    const token = localStorage.getItem("auth_token");
    
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
