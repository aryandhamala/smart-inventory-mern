const API_BASE = "http://localhost:4000/api";

export function getToken(): string | null {
    return localStorage.getItem("token");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Request failed (${res.status})`);
    }
    return res.json() as Promise<T>;
}