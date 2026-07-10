import { Router } from "express";
import { prisma } from "../prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { authenticate, requireRole } from "../auth/middleware";
import { forbidden, notFound } from "../lib/errors";

export const partnerRouter = Router();
partnerRouter.use(authenticate);

/* ---- OWN-09: a partner's own dashboard — their schools + commission only ---- */
partnerRouter.get(
  "/partners/:id/dashboard",
  requireRole("partner", "owner"),
  asyncHandler(async (req, res) => {
    if (req.user!.role === "partner" && req.user!.partnerId !== req.params.id) throw forbidden();

    const partner = await prisma.partner.findUnique({
      where: { id: req.params.id },
      include: { schools: { include: { package: true } }, tier: true },
    });
    if (!partner) throw notFound("Partner");

    const monthlyRevenue = partner.schools
      .filter((s) => s.subscriptionStatus === "active" && s.package)
      .reduce((sum, s) => sum + (s.package?.priceMonthly ?? 0), 0);
    const commission = monthlyRevenue * (partner.commissionPercent / 100);

    res.json({ partner, monthlyRevenue, commission, schoolsCount: partner.schools.length });
  })
);
