import APIError from "@/lib/api/APIError";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

class BaseAPIService {
  private readonly baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

  async request(url: string, method: HttpMethod, params: Record<string, unknown> = {}) {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("_token") : null;

    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let fullUrl = `${this.baseUrl}${url}`;
    const init: RequestInit = { method, headers };

    if (method === "GET") {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const query = searchParams.toString();
      if (query) {
        fullUrl += `?${query}`;
      }
    } else {
      init.body = JSON.stringify(params);
    }

    try {
      const response = await fetch(fullUrl, init);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && typeof window !== "undefined") {
          localStorage.removeItem("_token");
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }

        throw new APIError({
          message: data?.message ?? "Request failed",
          errors: data?.errors,
        });
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      throw new APIError({
        message:
          "Something went wrong. Please try again. If the problem persists, contact your system administrator",
      });
    }
  }
}

export default BaseAPIService;
