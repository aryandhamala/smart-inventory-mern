import React, { createContext, useContext, useMemo, useState } from "react";

export type Role = "owner" | "staff";
export type User = { id: string; name: string; email: string; role: Role };

type AuthCtx = {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [user, setUser] = useState<User | null>(() => {
        const raw = localStorage.getItem("user");
        return raw ? (JSON.parse(raw) as User) : null;
    });

    const value = useMemo<AuthCtx>(() => ({
        user,
        token,
        login: (t, u) => {
            localStorage.setItem("token", t);
            localStorage.setItem("user", JSON.stringify(u));
            setToken(t);
            setUser(u);
        },
        logout: () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
        }
    }), [user, token]);

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("AuthProvider missing");
    return ctx;
}