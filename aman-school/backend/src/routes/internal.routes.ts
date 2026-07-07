import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { forbidden } from "../lib/errors";

export const internalRouter = Router();

/** One-off deploy helper: reseeds demo data, guarded by a shared secret so it's
 * never reachable without the env var configured on the deploy. Remove once
 * the initial production seed has run. Loaded via require() (not a static
 * import) since prisma/seed.ts lives outside backend/tsconfig.json's rootDir. */
internalRouter.post(
  "/internal/seed",
  asyncHandler(async (req, res) => {
    const secret = process.env.SEED_SECRET;
    if (!secret || req.header("x-seed-secret") !== secret) throw forbidden();
    const seedModule = require("../../prisma/seed") as { main: () => Promise<void> };
    await seedModule.main();
    res.json({ ok: true });
  })
);
