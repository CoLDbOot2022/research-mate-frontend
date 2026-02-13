/**
 * API Client Utility
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

type ApiError = {
    detail?: string;
    error?: {
        message?: string;
    };
};

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...customConfig } = options;

    let url = `${BASE_URL}${endpoint}`;
    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (customConfig.headers instanceof Headers) {
        customConfig.headers.forEach((value, key) => {
            headers[key] = value;
        });
    } else if (Array.isArray(customConfig.headers)) {
        customConfig.headers.forEach(([key, value]) => {
            headers[key] = value;
        });
    } else if (customConfig.headers) {
        Object.assign(headers, customConfig.headers as Record<string, string>);
    }

    // JWT Token check (to be implemented with AuthContext)
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...customConfig,
        headers,
    };

    try {
        const response = await fetch(url, config);

        if (response.status === 401 && typeof window !== 'undefined') {
            // Handle token expiration / redirect to login
            // localStorage.removeItem('accessToken');
            // window.location.href = '/login';
        }

        const data = (await response.json()) as T | ApiError;

        if (response.ok) {
            return data as T;
        }

        const errorData = data as ApiError;
        throw new Error(errorData.error?.message || errorData.detail || response.statusText);
    } catch (error: unknown) {
        if (error instanceof Error) {
            return Promise.reject(error.message);
        }
        return Promise.reject('Something went wrong');
    }
}

export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
