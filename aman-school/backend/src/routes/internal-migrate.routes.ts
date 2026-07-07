import { Router } from "express";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const internalMigrateRouter = Router();

/** Temporary, secret-gated schema-push endpoint for the v3.1 production
 * migration — mirrors the earlier /internal/seed pattern. Removed once the
 * live schema push is confirmed. */
internalMigrateRouter.post("/internal/migrate", async (req, res) => {
  const secret = req.header("x-migrate-secret");
  if (!secret || secret !== process.env.MIGRATE_SECRET) {
    return res.status(404).json({ error: "Not found" });
  }
  try {
    const { stdout, stderr } = await execFileAsync(
      "npx",
      ["prisma", "db", "push", "--schema=backend/prisma/schema.prisma", "--skip-generate", "--accept-data-loss"],
      { cwd: process.cwd(), timeout: 55000 }
    );
    res.json({ ok: true, stdout, stderr });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message, stdout: e.stdout, stderr: e.stderr });
  }
});
