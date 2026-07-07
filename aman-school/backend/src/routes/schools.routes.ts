import { Router } from "express";
import { prisma } from "../prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { authenticate, assertSchoolAccess, requireRole } from "../auth/middleware";
import { badRequest, notFound } from "../lib/errors";
import { hashSecret } from "../lib/password";
import { randomDigits, randomEmployeeCode } from "../lib/codes";
import { toUserDto } from "../lib/dto";
import { nextStudentCode } from "./students.routes";

export const schoolsRouter = Router();
schoolsRouter.use(authenticate);

/* ---- SCH-11: fetch current school info (prefills the settings form) ---- */
schoolsRouter.get(
  "/schools/:id",
  asyncHandler(async (req, res) => {
    assertSchoolAccess(req.user!, req.params.id);
    const school = await prisma.school.findUnique({ where: { id: req.params.id }, include: { package: true } });
    if (!school) throw notFound("School");
    res.json(school);
  })
);

/* ---- SCH-02: dashboard summary ---- */
schoolsRouter.get(
  "/schools/:id/dashboard-summary",
  asyncHandler(async (req, res) => {
    assertSchoolAccess(req.user!, req.params.id);
    const schoolId = req.params.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [activeTrips, todayTrips, totalStudents, activeAlerts, buses] = await Promise.all([
      prisma.trip.count({ where: { schoolId, status: "active" } }),
      prisma.trip.findMany({ where: { schoolId, scheduledAt: { gte: startOfDay, lte: endOfDay } } }),
      prisma.student.count({ where: { schoolId, status: "active" } }),
      prisma.alert.findMany({ where: { schoolId, status: "active" }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.bus.findMany({ where: { schoolId } }),
    ]);

    const completedToday = todayTrips.filter((t) => t.status === "completed").length;
    const studentsOnTheWay = await prisma.tripEvent.count({
      where: {
        type: "board",
        timestamp: { gte: startOfDay },
        trip: { schoolId, status: "active" },
      },
    });

    res.json({
      activeTripsCount: activeTrips,
      todayTripsTotal: todayTrips.length,
      todayTripsCompleted: completedToday,
      studentsOnTheWay,
      totalStudents,
      totalBuses: buses.length,
      recentAlerts: activeAlerts,
    });
  })
);

/* ---- SCH-03: students list + create ---- */
schoolsRouter.get(
  "/schools/:id/students",
  asyncHandler(async (req, res) => {
    assertSchoolAccess(req.user!, req.params.id);
    const { grade, busId, q } = req.query as Record<string, string | undefined>;
    const where: any = { schoolId: req.params.id };
    if (grade) where.grade = grade;
    if (busId) where.busId = busId;
    if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { code: { contains: q, mode: "insensitive" } }];
    const students = await prisma.student.findMany({ where, orderBy: { name: "asc" } });
    res.json(students);
  })
);

schoolsRouter.post(
  "/schools/:id/students",
  requireRole("school_admin", "owner", "partner"),
  asyncHandler(async (req, res) => {
    assertSchoolAccess(req.user!, req.params.id);
    const { name, grade, busId, stopId, photoUrl } = req.body ?? {};
    if (!name || !grade) throw badRequest("name and grade are required");
    const code = await nextStudentCode(req.params.id);
    const student = await prisma.student.create({
      data: { schoolId: req.params.id, code, name, grade, busId: busId ?? null, stopId: stopId ?? null, photoUrl: photoUrl ?? null },
    });
    res.status(201).json(student);
  })
);

/* ---- SCH-05: buses list + create ---- */
schoolsRouter.get(
  "/schools/:id/buses",
  asyncHandler(async (req, res) => {
    assertSchoolAccess(req.user!, req.params.id);
    const buses = await prisma.bus.findMany({ where: { schoolId: req.params.id }, include: { route: { include: { stops: true } } } });
    res.json(buses);
  })
);

schoolsRouter.post(
  "/schools/:id/buses",
  requireRole("school_admin", "owner", "partner"),
  asyncHandler(async (req, res) => {
    assertSchoolAccess(req.user!, req.params.id);
    const { busNumber, plateNumber, capacity } = req.body ?? {};
    if (!busNumber || !plateNumber || !capacity) throw badRequest("busNumber, plateNumber and capacity are required");
    const bus = await prisma.bus.create({ data: { schoolId: req.params.id, busNumber, plateNumber, capacity } });
    res.status(201).json(bus);
  })
);

/* ---- SCH-06: supervisors list + create (auto-provisions their login) ---- */
schoolsRouter.get(
  "/schools/:id/supervisors",
  asyncHandler(async (req, res) => {
    assertSchoolAccess(req.user!, req.params.id);
    const supervisors = await prisma.user.findMany({
      where: { schoolId: req.params.id, role: "supervisor" },
      include: { supervisedBus: true },
    });
    res.json(supervisors.map(toUserDto));
  })
);

schoolsRouter.post(
  "/schools/:id/supervisors",
  requireRole("school_admin", "owner", "partner"),
  asyncHandler(async (req, res) => {
    assertSchoolAccess(req.user!, req.params.id);
    const { name, phone, busId } = req.body ?? {};
    if (!name || !phone) throw badRequest("name and phone are required");

    const employeeCode = randomEmployeeCode();
    const pin = randomDigits(4);
    const supervisor = await prisma.user.create({
      data: {
        role: "supervisor",
        name,
        phone,
        schoolId: req.params.id,
        employeeCode,
        pinHash: hashSecret(pin),
        supervisedBus: busId ? { connect: { id: busId } } : undefined,
      },
    });

    // No real SMS provider in this environment — see auth.routes.ts OTP note
    // for the same dev-only pattern. Production sends this via SMS gateway.
    console.log(`[dev-sms] Supervisor app credentials for ${name} (${phone}): employeeCode=${employeeCode} pin=${pin}`);

    res.status(201).json({ ...toUserDto(supervisor), devEmployeeCode: employeeCode, devPin: pin });
  })
);

/* ---- SCH-09: reports (attendance/delay summary over a date range) ---- */
schoolsRouter.get(
  "/schools/:id/reports",
  asyncHandler(async (req, res) => {
    assertSchoolAccess(req.user!, req.params.id);
    const from = req.query.from ? new Date(String(req.query.from)) : new Date(Date.now() - 30 * 86400000);
    const to = req.query.to ? new Date(String(req.query.to)) : new Date();

    const trips = await prisma.trip.findMany({
      where: { schoolId: req.params.id, scheduledAt: { gte: from, lte: to } },
    });
    const alerts = await prisma.alert.findMany({
      where: { schoolId: req.params.id, createdAt: { gte: from, lte: to } },
    });

    res.json({
      range: { from, to },
      tripsScheduled: trips.length,
      tripsCompleted: trips.filter((t) => t.status === "completed").length,
      tripsCancelled: trips.filter((t) => t.status === "cancelled").length,
      alertsByType: {
        sos: alerts.filter((a) => a.type === "sos").length,
        delay: alerts.filter((a) => a.type === "delay").length,
        incident: alerts.filter((a) => a.type === "incident").length,
        exception: alerts.filter((a) => a.type === "exception").length,
      },
    });
  })
);

/* ---- SCH-10: broadcast a notification to every parent of the school's students ---- */
schoolsRouter.post(
  "/schools/:id/notifications/broadcast",
  requireRole("school_admin", "owner", "partner"),
  asyncHandler(async (req, res) => {
    assertSchoolAccess(req.user!, req.params.id);
    const { title, body } = req.body ?? {};
    if (!title || !body) throw badRequest("title and body are required");

    const links = await prisma.studentParentLink.findMany({ where: { schoolId: req.params.id }, select: { parentUserId: true } });
    const parentIds = [...new Set(links.map((l) => l.parentUserId))];
    await prisma.notification.createMany({
      data: parentIds.map((userId) => ({ userId, title, body, type: "broadcast" })),
    });
    res.status(201).json({ ok: true, recipients: parentIds.length });
  })
);

/* ---- SCH-11: school settings ---- */
schoolsRouter.put(
  "/schools/:id/settings",
  requireRole("school_admin", "owner", "partner"),
  asyncHandler(async (req, res) => {
    assertSchoolAccess(req.user!, req.params.id);
    const { name, address, logoUrl } = req.body ?? {};
    const updated = await prisma.school.update({ where: { id: req.params.id }, data: { name, address, logoUrl } });
    res.json(updated);
  })
);

/* ---- OWN-02: owner toggles a school's subscription status ---- */
schoolsRouter.put(
  "/schools/:id/status",
  requireRole("owner", "partner"),
  asyncHandler(async (req, res) => {
    const { status } = req.body ?? {};
    if (!status) throw badRequest("status is required");
    const school = await prisma.school.findUnique({ where: { id: req.params.id } });
    if (!school) throw notFound("School");
    const updated = await prisma.school.update({ where: { id: req.params.id }, data: { subscriptionStatus: status } });
    res.json(updated);
  })
);
