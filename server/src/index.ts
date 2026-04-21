import "dotenv/config";
import { app } from "./app";
import { connectDb } from "./config/db";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function main() {
    await connectDb();
    app.listen(PORT, () => console.log(`✅ API listening on http://localhost:${PORT}`));
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});