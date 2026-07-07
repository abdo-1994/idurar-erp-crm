import { Router } from "express";
import type { JwtClaims } from "@aman-school/types";
import { prisma } from "../prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { authenticate, requireRole } from "../auth/middleware";
import { badRequest, forbidden, notFound } from "../lib/errors";
import { buildStudentCode } from "../lib/codes";
import QRCode from "qrcode";

export const studentsRouter = Router();
studentsRouter.use(authenticate);

async function assertStudentAccess(user: JwtClaims, student: { id: string; schoolId: string }) {
  if (user.role === "owner" || user.role === "partner") return;
  if (user.role === "parent") {
    const link = await prisma.studentParentLink.findFirst({ where: { studentId: student.id, parentUserId: user.sub } });
    if (!link) throw forbidden("This student is not linked to your account");
    return;
  }
  if (user.schoolId !== student.schoolId) throw forbidden();
}

/* ---- S-07: search roster (supervisor manual entry) ---- */
studentsRouter.get(
  "/students/search",
  requireRole("supervisor", "school_admin", "ops_room", "owner", "partner"),
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? "").trim();
    if (!q) return res.json([]);
    const where: any = {
      OR: [{ name: { contains: q, mode: "insensitive" } }, { code: { contains: q, mode: "insensitive" } }],
    };
    if (req.user!.role !== "owner" && req.user!.role !== "partner") {
      where.schoolId = req.user!.schoolId;
    }
    const students = await prisma.student.findMany({ where, take: 20 });
    res.json(students);
  })
);

studentsRouter.get(
  "/students/:id/today-status",
  asyncHandler(async (req, res) => {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) throw notFound("Student");
    await assertStudentAccess(req.user!, student);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const lastEvent = await prisma.tripEvent.findFirst({
      where: { studentId: student.id, timestamp: { gte: startOfDay } },
      orderBy: { timestamp: "desc" },
      include: { trip: true },
    });

    let status: "home" | "on_the_way" | "at_school" = "home";
    if (lastEvent) {
      if (lastEvent.type === "board") status = "on_the_way";
      else status = lastEvent.trip.direction === "to_school" ? "at_school" : "home";
    }
    res.json({ studentId: student.id, status, lastEvent: lastEvent ?? null });
  })
);

studentsRouter.get(
  "/students/:id/details",
  asyncHandler(async (req, res) => {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: { bus: { include: { supervisor: true } }, stop: true, school: true },
    });
    if (!student) throw notFound("Student");
    await assertStudentAccess(req.user!, student);
    res.json(student);
  })
);

studentsRouter.get(
  "/students/:id",
  asyncHandler(async (req, res) => {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) throw notFound("Student");
    await assertStudentAccess(req.user!, student);
    res.json(student);
  })
);

studentsRouter.put(
  "/students/:id",
  requireRole("school_admin", "owner", "partner"),
  asyncHandler(async (req, res) => {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) throw notFound("Student");
    await assertStudentAccess(req.user!, student);
    const { name, grade, photoUrl, busId, stopId, status } = req.body ?? {};
    const updated = await prisma.student.update({
      where: { id: student.id },
      data: { name, grade, photoUrl, busId, stopId, status },
    });
    res.json(updated);
  })
);

studentsRouter.put(
  "/students/:id/stop",
  requireRole("school_admin", "owner", "partner"),
  asyncHandler(async (req, res) => {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) throw notFound("Student");
    await assertStudentAccess(req.user!, student);
    const { stopId } = req.body ?? {};
    if (!stopId) throw badRequest("stopId is required");
    const updated = await prisma.student.update({ where: { id: student.id }, data: { stopId } });
    res.json(updated);
  })
);

studentsRouter.get(
  "/students/:id/qr-code",
  asyncHandler(async (req, res) => {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) throw notFound("Student");
    await assertStudentAccess(req.user!, student);
    const qrDataUrl = await QRCode.toDataURL(student.code);
    res.json({ qrDataUrl });
  })
);

studentsRouter.get(
  "/students/:id/trips",
  asyncHandler(async (req, res) => {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) throw notFound("Student");
    await assertStudentAccess(req.user!, student);

    const from = req.query.from ? new Date(String(req.query.from)) : new Date(0);
    const to = req.query.to ? new Date(String(req.query.to)) : new Date();
    if (!student.busId) return res.json([]);

    const trips = await prisma.trip.findMany({
      where: { busId: student.busId, schoolId: student.schoolId, scheduledAt: { gte: from, lte: to } },
      orderBy: { scheduledAt: "desc" },
    });
    res.json(trips);
  })
);

// Exposed for the school module's student-creation flow (SCH-03), which needs
// a deterministic next serial for the code format `{slug}-{year}-{serial}`.
export async function nextStudentCode(schoolId: string): Promise<string> {
  const school = await prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
  const year = new Date().getFullYear();
  const count = await prisma.student.count({ where: { schoolId } });
  return buildStudentCode(school.slug, year, count + 1);
}
