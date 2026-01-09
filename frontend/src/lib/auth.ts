type ApiSuccess<T> = {
    success: true;
    data: T;
};

type ApiError = {
    success: false;
    error: {
        code?: string;
        message: string;
        details?: string[];
    };
};

export type AuthUser = {
    id: string;
    email: string;
    displayName: string;
    role: string;
};

type LoginResponse = {
    accessToken: string;
    user: AuthUser;
};

type RegisterResponse = {
    user: AuthUser;
};

const ACCESS_TOKEN_KEY = "access_token";
const AUTH_USER_KEY = "auth_user";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function isBrowser() {
    return typeof window !== "undefined";
}

function getApiUrl(path: string) {
    if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is not set");
    }

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    return `${API_URL}${path}`;
}

async function readJson<T>(res: Response): Promise<T | null> {
    const text = await res.text();
    if (!text) return null;

    try {
        return JSON.parse(text) as T;
    } catch {
        return null;
    }
}

function getErrorMessage(payload: ApiError | null, fallback: string) {
    return payload?.error?.message ?? fallback;
}

export function getAccessToken() {
    if (!isBrowser()) return null;

    try {
        return window.localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
        return null;
    }
}

export function getAuthUser() {
    if (!isBrowser()) return null;

    try {
        const raw = window.localStorage.getItem(AUTH_USER_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

export function setAccessToken(token: string | null) {
    if (!isBrowser()) return;

    try {
        if (token) {
            window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
        } else {
            window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
    } catch {
        // Ignore storage errors (private mode, blocked, etc.)
    }
}

export function setAuthUser(user: AuthUser | null) {
    if (!isBrowser()) return;

    try {
        if (user) {
            window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        } else {
            window.localStorage.removeItem(AUTH_USER_KEY);
        }
    } catch {
        // Ignore storage errors (private mode, blocked, etc.)
    }
}

function decodeJwtPayload(token: string) {
    if (!isBrowser()) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    try {
        const payload = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");

        const json = atob(payload);
        return JSON.parse(json) as { exp?: number };
    } catch {
        return null;
    }
}

function isTokenValid(token: string, bufferSeconds = 30) {
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now + bufferSeconds;
}

export async function refreshAccessToken() {
    try {
        const res = await fetch(getApiUrl("/auth/refresh"), {
            method: "POST",
            credentials: "include",
        });

        if (!res.ok) {
            setAccessToken(null);
            setAuthUser(null);
            return false;
        }

        const payload = await readJson<ApiSuccess<{ accessToken: string }> | ApiError>(res);

        if (!payload || !("success" in payload) || !payload.success) {
            setAccessToken(null);
            setAuthUser(null);
            return false;
        }

        if (!payload.data?.accessToken) {
            setAccessToken(null);
            setAuthUser(null);
            return false;
        }

        setAccessToken(payload.data.accessToken);
        return true;
    } catch {
        setAccessToken(null);
        setAuthUser(null);
        return false;
    }
}

export async function ensureAccessToken() {
    const token = getAccessToken();
    if (token && isTokenValid(token)) return true;

    return await refreshAccessToken();
}

export async function login(credentials: { email: string; password: string }) {
    const res = await fetch(getApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
    });

    const payload = await readJson<ApiSuccess<LoginResponse> | ApiError>(res);

    if (!res.ok || !payload || !("success" in payload) || !payload.success) {
        throw new Error(getErrorMessage(payload as ApiError | null, "Login failed"));
    }

    setAccessToken(payload.data.accessToken);
    setAuthUser(payload.data.user);
    return payload.data;
}

export async function register(payload: { displayName: string; email: string; password: string }) {
    const res = await fetch(getApiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    const response = await readJson<ApiSuccess<RegisterResponse> | ApiError>(res);

    if (!res.ok || !response || !("success" in response) || !response.success) {
        throw new Error(getErrorMessage(response as ApiError | null, "Registration failed"));
    }

    return response.data;
}

export async function logout() {
    try {
        await fetch(getApiUrl("/auth/logout"), {
            method: "POST",
            credentials: "include",
        });
    } catch {
        // Ignore logout errors
    } finally {
        setAccessToken(null);
        setAuthUser(null);
    }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers ?? {});
    const token = getAccessToken();

    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const credentials = options.credentials ?? "include";

    const res = await fetch(getApiUrl(path), {
        ...options,
        headers,
        credentials,
    });

    if (res.status !== 401) return res;

    const refreshed = await refreshAccessToken();
    if (!refreshed) return res;

    const nextHeaders = new Headers(options.headers ?? {});
    const nextToken = getAccessToken();

    if (nextToken && !nextHeaders.has("Authorization")) {
        nextHeaders.set("Authorization", `Bearer ${nextToken}`);
    }

    return fetch(getApiUrl(path), {
        ...options,
        headers: nextHeaders,
        credentials,
    });
}
