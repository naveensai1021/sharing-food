export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

function normalizeUrl(endpoint: string): string {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }
  let path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (!path.startsWith("/api/")) {
    path = `/api${path}`;
  }
  return `${BASE_URL}${path}`;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = normalizeUrl(endpoint);
  
  // Set default headers
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Include credentials for HttpOnly session / JWT cookies
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let errorData = null;
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      try {
        errorMessage = await response.text();
      } catch {
        // ignore fallback
      }
    }
    throw new ApiError(errorMessage, response.status, errorData);
  }

  // Handle empty 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export interface ApiResponse<T> {
  data: T;
  status: number;
}

const apiClient = {
  get: async <T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> => {
    const data = await apiFetch<T>(url, { ...options, method: "GET" });
    return { data, status: 200 };
  },

  post: async <T>(url: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> => {
    const isFormData = body instanceof FormData;
    const data = await apiFetch<T>(url, {
      ...options,
      method: "POST",
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
    return { data, status: 200 };
  },

  put: async <T>(url: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> => {
    const isFormData = body instanceof FormData;
    const data = await apiFetch<T>(url, {
      ...options,
      method: "PUT",
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
    return { data, status: 200 };
  },

  patch: async <T>(url: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> => {
    const isFormData = body instanceof FormData;
    const data = await apiFetch<T>(url, {
      ...options,
      method: "PATCH",
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
    return { data, status: 200 };
  },

  delete: async <T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> => {
    const data = await apiFetch<T>(url, { ...options, method: "DELETE" });
    return { data, status: 200 };
  },
};

export default apiClient;
