import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/http";
import { updateProduct } from "../api/products";
import { GlassCard, GlassPanel } from "../components/Glass";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

type ProductForm = {
    _id: string;
    sku: string;
    name: string;
    category: string;
    price: number;
    quantityInStock: number;
    reorderThreshold: number;
};

export function EditProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState<ProductForm | null>(null);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await api<ProductForm>(`/products/${id}`);
                setForm(data);
            } catch (e: any) {
                setErr(e.message || "Failed to load product");
            }
        }
        if (id) load();
    }, [id]);

    async function save(e: React.FormEvent) {
        e.preventDefault();
        if (!form) return;

        setErr(null);
        setOk(null);
        setBusy(true);

        try {
            await updateProduct(form._id, {
                sku: form.sku,
                name: form.name,
                category: form.category,
                price: form.price,
                quantityInStock: form.quantityInStock,
                reorderThreshold: form.reorderThreshold,
            });

            setOk("Product updated successfully.");

            setTimeout(() => {
                navigate("/products");
            }, 800);
        } catch (e: any) {
            setErr(e.message || "Failed to update product");
        } finally {
            setBusy(false);
        }
    }

    if (!form) {
        return (
            <GlassCard>
                <div className="text-sm text-white/60">Loading product...</div>
            </GlassCard>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="text-2xl font-bold tracking-tight">Edit Product</div>
                <div className="text-sm text-white/60">
                    Update product details and stock configuration
                </div>
            </div>

            {err && <GlassPanel className="border-red-400/30">{err}</GlassPanel>}
            {ok && <GlassPanel className="border-emerald-400/30">{ok}</GlassPanel>}

            <GlassCard>
                <form className="grid gap-4 md:grid-cols-2" onSubmit={save}>
                    <Input
                        label="SKU"
                        value={form.sku}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    />

                    <Input
                        label="Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />

                    <Input
                        label="Category"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                    />

                    <Input
                        label="Price"
                        type="number"
                        min={0}
                        value={form.price}
                        onChange={(e) =>
                            setForm({ ...form, price: Number(e.target.value) })
                        }
                    />

                    <Input
                        label="Quantity In Stock"
                        type="number"
                        min={0}
                        value={form.quantityInStock}
                        onChange={(e) =>
                            setForm({ ...form, quantityInStock: Number(e.target.value) })
                        }
                    />

                    <Input
                        label="Reorder Threshold"
                        type="number"
                        min={0}
                        value={form.reorderThreshold}
                        onChange={(e) =>
                            setForm({ ...form, reorderThreshold: Number(e.target.value) })
                        }
                    />

                    <div className="md:col-span-2 flex gap-3">
                        <Button disabled={busy}>
                            {busy ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button type="button" onClick={() => navigate("/products")}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}