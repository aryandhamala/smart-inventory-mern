import { api } from "./http";

export function listStaffUsers() {
    return api<
        Array<{
            _id: string;
            name: string;
            email: string;
            role: string;
            createdAt: string;
            updatedAt: string;
        }>
    >("/users/staff");
}

export function deleteStaffUser(id: string) {
    return api<{ ok: true }>(`/users/staff/${id}`, {
        method: "DELETE",
    });
}