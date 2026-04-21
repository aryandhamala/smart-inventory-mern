import { getToken } from "./http";

const API_BASE = "http://localhost:4000/api";

export async function downloadFile(path: string, filename: string) {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Download failed (${res.status})`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
}