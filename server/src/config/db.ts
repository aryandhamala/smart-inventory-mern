import mongoose from "mongoose";
import { mustGetEnv } from "../utils/env";

export async function connectDb() {
    const uri = mustGetEnv("MONGODB_URI");
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
}