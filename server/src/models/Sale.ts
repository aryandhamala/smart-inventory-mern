import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        lineTotal: { type: Number, required: true, min: 0 }
    },
    { _id: false }
);

const saleSchema = new mongoose.Schema(
    {
        items: { type: [saleItemSchema], required: true },
        totalAmount: { type: Number, required: true, min: 0 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: true }
);

export const Sale = mongoose.model("Sale", saleSchema);