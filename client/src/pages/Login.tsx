import React, { useEffect, useState } from "react";
import { GlassCard } from "../components/Glass";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { loginApi } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
    const { login, token } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    // ✅ If already logged in, go to dashboard
    useEffect(() => {
        if (token) navigate("/dashboard", { replace: true });
    }, [token, navigate]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setBusy(true);
        try {
            const { token, user } = await loginApi(email, password);
            login(token, user);
            navigate("/dashboard", { replace: true }); // ✅ redirect after login
        } catch (e: any) {
            setErr(e.message || "Login failed");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="grid place-items-center min-h-[70vh]">
            <GlassCard className="w-full max-w-md">
                <div className="text-xl font-bold">Sign in</div>
                <div className="mt-1 text-sm text-white/60">Use your Owner/Staff account</div>

                <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                    <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@shop.com" />
                    <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    {err && <div className="text-sm text-red-300">{err}</div>}
                    <Button disabled={busy} className="w-full">{busy ? "Signing in..." : "Login"}</Button>
                </form>

                <div className="mt-5 text-xs text-white/50">
                    First time? Create users via POST /api/auth/register (owner does admin).
                </div>
            </GlassCard>
        </div>
    );
}