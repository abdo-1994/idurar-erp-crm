import { Router } from "express";
import { prisma } from "../prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { authenticate } from "../auth/middleware";
import { badRequest, forbidden, notFound } from "../lib/errors";
import { PARENT_PACKAGE_TIERS, SCHOOL_PACKAGE_TIERS } from "@aman-school/types";

export const subscriptionsRouter = Router();
subscriptionsRouter.use(authenticate);

/* ---- G-3/subscribe: canonical Yemen pricing for both audiences ---- */
subscriptionsRouter.get(
  "/packages/catalog",
  asyncHandler(async (req, res) => {
    const audience = (req.query.audience as string) ?? "parent";
    res.json(audience === "school" ? SCHOOL_PACKAGE_TIERS : PARENT_PACKAGE_TIERS);
  })
);

/* ---- P-6: a parent's own current subscription status ---- */
subscriptionsRouter.get(
  "/parents/:id/subscription",
  asyncHandler(async (req, res) => {
    if (req.user!.role === "parent" && req.user!.sub !== req.params.id) throw forbidden();
    const parent = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!parent) throw notFound("Parent");
    res.json({ tier: parent.subscriptionTier, endsAt: parent.subscriptionEndsAt });
  })
);

/* ---- P-6: a parent chooses/changes their subscription tier ---- */
subscriptionsRouter.post(
  "/parents/:id/subscription",
  asyncHandler(async (req, res) => {
    if (req.user!.role !== "parent" || req.user!.sub !== req.params.id) throw forbidden();
    const { tier, cycle } = req.body ?? {};
    const plan = PARENT_PACKAGE_TIERS.find((p) => p.tier === tier);
    if (!plan) throw badRequest("Unknown package tier");

    const days = cycle === "yearly" ? 365 : cycle === "quarterly" ? 90 : 30;
    const endsAt = new Date(Date.now() + days * 86400000);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { subscriptionTier: plan.name, subscriptionEndsAt: endsAt },
    });
    res.json({ ok: true, tier: plan.name, endsAt });
  })
);

/* ---- G-4/payment: submit a payment (dev-auto-confirmed, no real gateway) ---- */
subscriptionsRouter.post(
  "/payments",
  asyncHandler(async (req, res) => {
    const { subjectType, subjectId, packageName, cycle, amount, method, receiptUrl } = req.body ?? {};
    if (!subjectType || !subjectId || !packageName || !cycle || !amount || !method) {
      throw badRequest("subjectType, subjectId, packageName, cycle, amount and method are required");
    }
    if (subjectType === "parent" && req.user!.sub !== subjectId) throw forbidden();

    const payment = await prisma.payment.create({
      data: {
        subjectType,
        parentUserId: subjectType === "parent" ? subjectId : null,
        schoolId: subjectType === "school" ? subjectId : null,
        packageName,
        cycle,
        amount,
        method,
        receiptUrl: receiptUrl ?? null,
        // No real payment gateway is integrated in this build — submissions are
        // auto-confirmed the same way OTP is dev-shortcut (see auth.routes.ts).
        // Production would leave this "pending" until eCash/bank-transfer/cash
        // is manually reconciled by an operator.
        status: "confirmed",
        confirmedAt: new Date(),
      },
    });
    res.status(201).json(payment);
  })
);

subscriptionsRouter.get(
  "/parents/:id/payments",
  asyncHandler(async (req, res) => {
    if (req.user!.role === "parent" && req.user!.sub !== req.params.id) throw forbidden();
    const payments = await prisma.payment.findMany({ where: { parentUserId: req.params.id }, orderBy: { createdAt: "desc" } });
    res.json(payments);
  })
);

subscriptionsRouter.get(
  "/schools/:id/payments",
  asyncHandler(async (req, res) => {
    const school = await prisma.school.findUnique({ where: { id: req.params.id } });
    if (!school) throw notFound("School");
    const payments = await prisma.payment.findMany({ where: { schoolId: req.params.id }, orderBy: { createdAt: "desc" } });
    res.json(payments);
  })
);
