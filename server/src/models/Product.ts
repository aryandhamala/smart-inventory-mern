import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        sku: { type: String, required: true, unique: true, trim: true },
        name: { type: String, required: true, trim: true },
        category: { type: String, default: "", trim: true },
        price: { type: Number, required: true, min: 0 },
        quantityInStock: { type: Number, required: true, min: 0 },
        reorderThreshold: { type: Number, default: 5, min: 0 }
    },
    { timestamps: true }
);

productSchema.index({ name: "text", sku: "text", category: "text" });

export const Product = mongoose.model("Product", productSchema);