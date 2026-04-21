import mongoose from "mongoose";

export type MovementType = "sale" | "replenish" | "adjustment";

const stockMovementSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        type: { type: String, enum: ["sale", "replenish", "adjustment"], required: true },
        quantity: { type: Number, required: true, min: 1 },
        note: { type: String, default: "" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: true }
);

stockMovementSchema.index({ productId: 1, createdAt: -1 });

export const StockMovement = mongoose.model("StockMovement", stockMovementSchema);