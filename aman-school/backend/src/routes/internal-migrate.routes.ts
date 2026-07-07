import { Router } from "express";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { prisma } from "../prisma";

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

/** Idempotent supplemental seed for the two entities with no HTTP create
 * route (PartnerTier has no POST — it's meant to be seeded once) — adds the
 * silver/gold tiers and links the existing demo partner to silver, without
 * touching any pre-existing v3.0 demo data. */
internalMigrateRouter.post("/internal/seed-partner-tiers", async (req, res) => {
  const secret = req.header("x-migrate-secret");
  if (!secret || secret !== process.env.MIGRATE_SECRET) {
    return res.status(404).json({ error: "Not found" });
  }
  try {
    let silver = await prisma.partnerTier.findUnique({ where: { name: "silver" } });
    if (!silver) silver = await prisma.partnerTier.create({ data: { name: "silver", labelAr: "فضي", commissionPercent: 15, minActiveSchools: 0 } });
    let gold = await prisma.partnerTier.findUnique({ where: { name: "gold" } });
    if (!gold) gold = await prisma.partnerTier.create({ data: { name: "gold", labelAr: "ذهبي", commissionPercent: 20, minActiveSchools: 5 } });

    const partner = await prisma.partner.findFirst({ where: { tierId: null } });
    if (partner) await prisma.partner.update({ where: { id: partner.id }, data: { tierId: silver.id } });

    res.json({ ok: true, silver, gold, linkedPartnerId: partner?.id ?? null });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});
