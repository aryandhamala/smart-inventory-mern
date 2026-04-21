import React, { useEffect, useState } from "react";
import { GlassCard, GlassPanel } from "../components/Glass";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { api } from "../api/http";
import { listStaffUsers, deleteStaffUser } from "../api/users";

function formatDate(d: string) {
    return new Date(d).toLocaleString();
}

export function StaffUsersPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [staffUsers, setStaffUsers] = useState<
        Array<{
            _id: string;
            name: string;
            email: string;
            role: string;
            createdAt: string;
            updatedAt: string;
        }>
    >([]);

    const [deleteTarget, setDeleteTarget] = useState<{
        _id: string;
        name: string;
        email: string;
        role: string;
        createdAt: string;
        updatedAt: string;
    } | null>(null);

    const [err, setErr] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [deleteBusy, setDeleteBusy] = useState(false);

    async function loadStaff() {
        const users = await listStaffUsers();
        setStaffUsers(users);
    }

    useEffect(() => {
        loadStaff().catch((e) => setErr(e.message || "Failed to load staff users"));
    }, []);

    async function createStaff(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setOk(null);
        setBusy(true);
        try {
            await api("/auth/register", {
                method: "POST",
                body: JSON.stringify({ name, email, password, role: "staff" }),
            });
            setOk("Staff account created successfully.");
            setName("");
            setEmail("");
            setPassword("");
            await loadStaff();
        } catch (e: any) {
            setErr(e.message || "Failed to create staff account");
        } finally {
            setBusy(false);
        }
    }

    async function confirmDelete() {
        if (!deleteTarget) return;

        setErr(null);
        setOk(null);
        setDeleteBusy(true);

        try {
            await deleteStaffUser(deleteTarget._id);
            setOk(`Staff user "${deleteTarget.name}" deleted successfully.`);
            setDeleteTarget(null);
            await loadStaff();
        } catch (e: any) {
            setErr(e.message || "Failed to delete staff account");
        } finally {
            setDeleteBusy(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="text-2xl font-bold tracking-tight">Staff Accounts</div>
                <div className="text-sm text-white/60">
                    Owner-only: create and manage staff login accounts
                </div>
            </div>

            {err && <GlassPanel className="border-red-400/30">{err}</GlassPanel>}
            {ok && <GlassPanel className="border-emerald-400/30">{ok}</GlassPanel>}

            <GlassCard>
                <div className="font-semibold">Create new staff user</div>
                <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={createStaff}>
                    <Input
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        label="Temporary Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <div className="md:col-span-3">
                        <Button className="w-full md:w-auto" disabled={busy}>
                            {busy ? "Creating..." : "Create Staff Account"}
                        </Button>
                    </div>
                </form>

                <div className="mt-4 text-xs text-white/50">
                    Staff role is enforced automatically. Staff can record sales and view
                    products but cannot edit inventory.
                </div>
            </GlassCard>

            <GlassCard>
                <div className="flex items-center justify-between">
                    <div className="font-semibold">Created staff users</div>
                    <div className="text-xs text-white/50">
                        {staffUsers.length} account(s)
                    </div>
                </div>

                <div className="mt-4 divide-y divide-white/10">
                    {staffUsers.length === 0 ? (
                        <div className="text-sm text-white/60">
                            No staff users created yet.
                        </div>
                    ) : (
                        staffUsers.map((u) => (
                            <div
                                key={u._id}
                                className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between"
                            >
                                <div>
                                    <div className="font-medium">{u.name || "Unnamed staff"}</div>
                                    <div className="text-xs text-white/50">
                                        {u.email} · {u.role}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-xs text-white/50">
                                        Created: {formatDate(u.createdAt)}
                                    </div>
                                    <Button onClick={() => setDeleteTarget(u)}>Delete</Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900/90 p-6 shadow-2xl">
                        <div className="text-xl font-bold">Delete Staff User</div>
                        <div className="mt-3 text-sm text-white/70">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-white">
                                {deleteTarget.name}
                            </span>{" "}
                            ({deleteTarget.email})? This action cannot be undone.
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleteBusy}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleteBusy}
                            >
                                {deleteBusy ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}