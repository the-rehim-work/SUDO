export class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  private async request<T>(endpoint: string, method: "GET" | "POST" | "PUT", body?: unknown): Promise<T> {
    const token = this.getToken();
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error((payload as { error?: string }).error || "Request failed");
    }
    return payload as T;
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, "GET");
  }

  post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, "POST", body);
  }

  put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, "PUT", body);
  }
}

export const apiClient = new ApiClient();
