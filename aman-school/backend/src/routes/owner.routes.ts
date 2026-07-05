import { Router } from "express";
import { prisma } from "../prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { authenticate, requireRole } from "../auth/middleware";
import { badRequest, notFound } from "../lib/errors";
import { hashSecret } from "../lib/password";

export const ownerRouter = Router();
ownerRouter.use(authenticate);
ownerRouter.use(requireRole("owner"));

/* ---- OWN-01: platform-wide summary ---- */
ownerRouter.get(
  "/owner/platform-summary",
  asyncHandler(async (_req, res) => {
    const [totalSchools, activeSchools, totalStudents, schools] = await Promise.all([
      prisma.school.count(),
      prisma.school.count({ where: { subscriptionStatus: "active" } }),
      prisma.student.count({ where: { status: "active" } }),
      prisma.school.findMany({ include: { package: true } }),
    ]);
    const monthlyRevenue = schools
      .filter((s) => s.subscriptionStatus === "active" && s.package)
      .reduce((sum, s) => sum + (s.package?.priceMonthly ?? 0), 0);

    res.json({
      totalSchools,
      activeSchools,
      totalStudents,
      monthlyRevenue,
      recentSchools: schools
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5),
    });
  })
);

/* ---- OWN-02: schools list + registration (auto-provisions admin) ---- */
ownerRouter.get(
  "/owner/schools",
  asyncHandler(async (req, res) => {
    const { status, packageId, partnerId, q } = req.query as Record<string, string | undefined>;
    const where: any = {};
    if (status) where.subscriptionStatus = status;
    if (packageId) where.packageId = packageId;
    if (partnerId) where.partnerId = partnerId;
    if (q) where.name = { contains: q, mode: "insensitive" };
    const schools = await prisma.school.findMany({ where, include: { package: true, partner: true } });
    res.json(schools);
  })
);

ownerRouter.post(
  "/owner/schools/register",
  asyncHandler(async (req, res) => {
    const { name, slug, address, adminName, adminEmail, packageId, partnerId } = req.body ?? {};
    if (!name || !slug || !adminName || !adminEmail || !packageId) {
      throw badRequest("name, slug, adminName, adminEmail and packageId are required");
    }

    const school = await prisma.school.create({
      data: { name, slug, address: address ?? null, packageId, partnerId: partnerId ?? null, subscriptionStatus: "trial" },
    });

    const tempPassword = Math.random().toString(36).slice(2, 10);
    const admin = await prisma.user.create({
      data: {
        role: "school_admin",
        name: adminName,
        email: adminEmail,
        schoolId: school.id,
        passwordHash: hashSecret(tempPassword),
      },
    });

    // No email provider wired up in this dev environment — log the credentials
    // that would otherwise be emailed to the new school admin (see OWN-02 notes).
    console.log(`[dev-email] School admin credentials for ${adminEmail}: password=${tempPassword}`);

    res.status(201).json({ school, admin: { id: admin.id, email: admin.email }, devTempPassword: tempPassword });
  })
);

ownerRouter.get(
  "/owner/schools/:id/detail",
  asyncHandler(async (req, res) => {
    const school = await prisma.school.findUnique({
      where: { id: req.params.id },
      include: { package: true, partner: true, invoices: true, students: true, buses: true },
    });
    if (!school) throw notFound("School");
    res.json(school);
  })
);

/* ---- OWN-04: partners ---- */
ownerRouter.get(
  "/owner/partners",
  asyncHandler(async (_req, res) => {
    const partners = await prisma.partner.findMany({ include: { schools: true } });
    res.json(partners);
  })
);

ownerRouter.post(
  "/owner/partners/register",
  asyncHandler(async (req, res) => {
    const { name, region, commissionPercent } = req.body ?? {};
    if (!name || !region || commissionPercent == null) throw badRequest("name, region and commissionPercent are required");
    const partner = await prisma.partner.create({ data: { name, region, commissionPercent } });
    res.status(201).json(partner);
  })
);

ownerRouter.put(
  "/owner/partners/:id",
  asyncHandler(async (req, res) => {
    const { name, region, commissionPercent } = req.body ?? {};
    const updated = await prisma.partner.update({ where: { id: req.params.id }, data: { name, region, commissionPercent } });
    res.json(updated);
  })
);

/* ---- OWN-05: packages ---- */
ownerRouter.get(
  "/owner/packages",
  asyncHandler(async (_req, res) => {
    res.json(await prisma.package.findMany());
  })
);

ownerRouter.put(
  "/owner/packages/:id",
  asyncHandler(async (req, res) => {
    const { name, priceMonthly, studentLimit, features } = req.body ?? {};
    const updated = await prisma.package.update({
      where: { id: req.params.id },
      data: { name, priceMonthly, studentLimit, features },
    });
    res.json(updated);
  })
);

ownerRouter.get(
  "/owner/subscriptions",
  asyncHandler(async (_req, res) => {
    const schools = await prisma.school.findMany({ include: { package: true } });
    res.json(
      schools.map((s) => ({ schoolId: s.id, schoolName: s.name, package: s.package, status: s.subscriptionStatus }))
    );
  })
);

/* ---- OWN-06: revenue & billing ---- */
ownerRouter.get(
  "/owner/revenue/summary",
  asyncHandler(async (_req, res) => {
    const schools = await prisma.school.findMany({ where: { subscriptionStatus: "active" }, include: { package: true } });
    const monthlyRevenue = schools.reduce((sum, s) => sum + (s.package?.priceMonthly ?? 0), 0);
    res.json({ monthlyRevenue, annualRevenue: monthlyRevenue * 12, activeSchools: schools.length });
  })
);

ownerRouter.get(
  "/owner/invoices",
  asyncHandler(async (_req, res) => {
    res.json(await prisma.invoice.findMany({ include: { school: true }, orderBy: { issuedAt: "desc" } }));
  })
);

/* ---- OWN-07: platform analytics ---- */
ownerRouter.get(
  "/owner/analytics",
  asyncHandler(async (_req, res) => {
    const schools = await prisma.school.findMany({ include: { package: true } });
    const byPackage: Record<string, number> = {};
    for (const s of schools) {
      const name = s.package?.name ?? "بدون باقة";
      byPackage[name] = (byPackage[name] ?? 0) + 1;
    }
    res.json({
      totalSchools: schools.length,
      activeSchools: schools.filter((s) => s.subscriptionStatus === "active").length,
      schoolsByPackage: byPackage,
    });
  })
);

/* ---- OWN-08: platform settings (singleton JSON row) ---- */
ownerRouter.get(
  "/owner/platform-settings",
  asyncHandler(async (_req, res) => {
    const settings = await prisma.platformSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton", data: {} },
    });
    res.json(settings.data);
  })
);

ownerRouter.put(
  "/owner/platform-settings",
  asyncHandler(async (req, res) => {
    const updated = await prisma.platformSettings.upsert({
      where: { id: "singleton" },
      update: { data: req.body ?? {} },
      create: { id: "singleton", data: req.body ?? {} },
    });
    res.json(updated.data);
  })
);
