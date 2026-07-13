import { Router } from "express";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const internalMigrateRouter = Router();

/** Temporary, secret-gated schema-push endpoint for the `regulator` Role enum
 * addition — mirrors the earlier /internal/migrate pattern. Removed once
 * confirmed. */
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

/** Temporary, secret-gated one-off seed endpoint for the regulator test user
 * — production data was seeded before this role existed. Removed once
 * confirmed. */
internalMigrateRouter.post("/internal/seed-regulator", async (req, res) => {
  const secret = req.header("x-migrate-secret");
  if (!secret || secret !== process.env.MIGRATE_SECRET) {
    return res.status(404).json({ error: "Not found" });
  }
  try {
    const { prisma } = await import("../prisma");
    const { default: bcrypt } = await import("bcryptjs");
    const existing = await prisma.user.findFirst({ where: { role: "regulator" } });
    if (existing) return res.json({ ok: true, alreadyExists: true, id: existing.id });
    const user = await prisma.user.create({
      data: {
        role: "regulator",
        name: "هيئة النقل المدرسي — عدن",
        email: "regulator@amanschool.ye",
        passwordHash: bcrypt.hashSync("Regulator@12345", 10),
      },
    });
    res.json({ ok: true, id: user.id });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});
