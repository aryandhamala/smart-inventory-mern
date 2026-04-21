import { api } from "./http";
import type { User } from "../auth/AuthContext";

export async function loginApi(email: string, password: string) {
    return api<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
}