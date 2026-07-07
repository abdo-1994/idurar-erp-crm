import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const hash = (s: string) => bcrypt.hashSync(s, 10);

const SANAA = { lat: 15.3694, lng: 44.191 };

async function main() {
  console.log("Seeding Aman School demo data...");

  // ---- Packages (prices in Yemeni Rial — ر.ي) ----
  const [basic, advanced, full] = await Promise.all([
    prisma.package.create({ data: { name: "أساسي", priceMonthly: 50000, studentLimit: 100, features: ["تتبع مباشر", "إشعارات أساسية"] } }),
    prisma.package.create({ data: { name: "متقدم", priceMonthly: 120000, studentLimit: 300, features: ["تتبع مباشر", "تقارير", "غرفة عمليات"] } }),
    prisma.package.create({ data: { name: "شامل", priceMonthly: 250000, studentLimit: 1000, features: ["كل الميزات", "دعم أولوية"] } }),
  ]);

  // ---- Partner ----
  const partner = await prisma.partner.create({ data: { name: "شريك اليمن", region: "أمانة العاصمة صنعاء", commissionPercent: 15 } });

  // ---- Schools (صنعاء + عدن) ----
  const noor = await prisma.school.create({
    data: { name: "مدرسة النور", slug: "noor", address: "صنعاء، حي حدة", packageId: advanced.id, partnerId: partner.id, subscriptionStatus: "active" },
  });
  const amal = await prisma.school.create({
    data: { name: "مدرسة الأمل", slug: "amal", address: "عدن، حي المعلا", packageId: basic.id, subscriptionStatus: "trial" },
  });

  // ---- Platform-level users ----
  const owner = await prisma.user.create({
    data: { role: "owner", name: "مالك المنصة", email: "owner@amanschool.ye", passwordHash: hash("Owner@12345") },
  });
  const partnerUser = await prisma.user.create({
    data: { role: "partner", name: "شريك اليمن", email: "partner@amanschool.ye", passwordHash: hash("Partner@12345"), partnerId: partner.id },
  });

  // ---- School-scoped staff (noor) ----
  const noorAdmin = await prisma.user.create({
    data: { role: "school_admin", name: "مدير مدرسة النور", email: "admin@noor.amanschool.ye", passwordHash: hash("Admin@12345"), schoolId: noor.id },
  });
  const noorOps = await prisma.user.create({
    data: { role: "ops_room", name: "غرفة عمليات النور", email: "ops@noor.amanschool.ye", passwordHash: hash("Ops@12345"), schoolId: noor.id },
  });
  const amalAdmin = await prisma.user.create({
    data: { role: "school_admin", name: "مدير مدرسة الأمل", email: "admin@amal.amanschool.ye", passwordHash: hash("Admin@12345"), schoolId: amal.id },
  });

  // ---- Buses + routes (noor, صنعاء) ----
  const bus1 = await prisma.bus.create({ data: { schoolId: noor.id, busNumber: "101", plateNumber: "صنعاء 1234", capacity: 30 } });
  const bus2 = await prisma.bus.create({ data: { schoolId: noor.id, busNumber: "102", plateNumber: "صنعاء 5678", capacity: 30 } });

  const route1 = await prisma.route.create({ data: { schoolId: noor.id, busId: bus1.id } });
  const route1Stops = await Promise.all(
    [
      { order: 0, name: "المدرسة", lat: SANAA.lat, lng: SANAA.lng },
      { order: 1, name: "حي حدة", lat: 15.325, lng: 44.207 },
      { order: 2, name: "حي الصافية", lat: 15.313, lng: 44.216 },
      { order: 3, name: "شارع التحرير", lat: 15.354, lng: 44.206 },
      { order: 4, name: "حي الروضة", lat: 15.407, lng: 44.206 },
    ].map((s) => prisma.stop.create({ data: { routeId: route1.id, ...s } }))
  );

  const route2 = await prisma.route.create({ data: { schoolId: noor.id, busId: bus2.id } });
  const route2Stops = await Promise.all(
    [
      { order: 0, name: "المدرسة", lat: SANAA.lat, lng: SANAA.lng },
      { order: 1, name: "شارع الزبيري", lat: 15.362, lng: 44.191 },
      { order: 2, name: "حي سعوان", lat: 15.38, lng: 44.225 },
      { order: 3, name: "حي بيت بوس", lat: 15.3, lng: 44.18 },
    ].map((s) => prisma.stop.create({ data: { routeId: route2.id, ...s } }))
  );

  // ---- Supervisors (noor) ----
  const sup1Pin = "1234";
  const sup2Pin = "1234";
  const sup1 = await prisma.user.create({
    data: {
      role: "supervisor", name: "أحمد الصنعاني", phone: "+967712345671", schoolId: noor.id,
      employeeCode: "EMP-1001", pinHash: hash(sup1Pin), supervisedBus: { connect: { id: bus1.id } },
    },
  });
  const sup2 = await prisma.user.create({
    data: {
      role: "supervisor", name: "خالد الحضرمي", phone: "+967712345672", schoolId: noor.id,
      employeeCode: "EMP-1002", pinHash: hash(sup2Pin), supervisedBus: { connect: { id: bus2.id } },
    },
  });

  // ---- Students (noor: 10, split across the 2 buses) ----
  const noorStudents = await Promise.all(
    [
      { i: 1, name: "سارة أحمد", grade: "الأول ابتدائي", busId: bus1.id, stopId: route1Stops[1].id },
      { i: 2, name: "محمد علي", grade: "الثاني ابتدائي", busId: bus1.id, stopId: route1Stops[1].id },
      { i: 3, name: "علي حسن", grade: "الثالث ابتدائي", busId: bus1.id, stopId: route1Stops[2].id },
      { i: 4, name: "حسن حسن", grade: "الرابع ابتدائي", busId: bus1.id, stopId: route1Stops[2].id },
      { i: 5, name: "نورة سعد", grade: "الخامس ابتدائي", busId: bus1.id, stopId: route1Stops[3].id },
      { i: 6, name: "يوسف فهد", grade: "الأول ابتدائي", busId: bus2.id, stopId: route2Stops[1].id },
      { i: 7, name: "فهد ناصر", grade: "الثاني ابتدائي", busId: bus2.id, stopId: route2Stops[1].id },
      { i: 8, name: "ناصر عمر", grade: "الثالث ابتدائي", busId: bus2.id, stopId: route2Stops[2].id },
      { i: 9, name: "عمر خالد", grade: "الرابع ابتدائي", busId: bus2.id, stopId: route2Stops[2].id },
      { i: 10, name: "خالد وليد", grade: "الخامس ابتدائي", busId: bus2.id, stopId: route2Stops[3].id },
    ].map((s) =>
      prisma.student.create({
        data: { schoolId: noor.id, code: `NOOR-2026-${String(s.i).padStart(5, "0")}`, name: s.name, grade: s.grade, busId: s.busId, stopId: s.stopId },
      })
    )
  );

  const amalStudent = await prisma.student.create({
    data: { schoolId: amal.id, code: "AMAL-2026-00001", name: "لمى عبدالله", grade: "الأول ابتدائي" },
  });

  // ---- Parents (6), one deliberately cross-tenant (links a noor + an amal student) ----
  const parentDefs = [
    { name: "أبو سارة", phone: "+967700000001", studentIds: [noorStudents[0].id] },
    { name: "أبو محمد", phone: "+967700000002", studentIds: [noorStudents[1].id] },
    { name: "أم علي", phone: "+967700000003", studentIds: [noorStudents[2].id, noorStudents[3].id] },
    { name: "أبو نورة", phone: "+967700000004", studentIds: [noorStudents[4].id, amalStudent.id] }, // cross-tenant parent
    { name: "أم يوسف", phone: "+967700000005", studentIds: [noorStudents[5].id] },
    { name: "أبو فهد", phone: "+967700000006", studentIds: [noorStudents[6].id, noorStudents[7].id] },
  ];
  for (const p of parentDefs) {
    const parent = await prisma.user.create({ data: { role: "parent", name: p.name, phone: p.phone } });
    for (const studentId of p.studentIds) {
      const student = await prisma.student.findUniqueOrThrow({ where: { id: studentId } });
      await prisma.studentParentLink.create({ data: { studentId, parentUserId: parent.id, schoolId: student.schoolId } });
    }
  }
  // noorStudents[8] and [9] intentionally left unlinked to show the "not yet linked" state.

  // ---- Trips ----
  const today = new Date();
  today.setHours(6, 30, 0, 0);
  await prisma.trip.create({
    data: { schoolId: noor.id, busId: bus1.id, supervisorId: sup1.id, direction: "to_school", status: "scheduled", scheduledAt: today },
  });

  const startedAt = new Date();
  startedAt.setHours(6, 30, 0, 0);
  const endedAt = new Date();
  endedAt.setHours(7, 15, 0, 0);
  const completedTrip = await prisma.trip.create({
    data: {
      schoolId: noor.id, busId: bus2.id, supervisorId: sup2.id, direction: "to_school",
      status: "completed", scheduledAt: startedAt, startedAt, endedAt,
    },
  });
  for (const student of [noorStudents[5], noorStudents[6]]) {
    await prisma.tripEvent.create({ data: { tripId: completedTrip.id, studentId: student.id, type: "board", method: "nfc", timestamp: startedAt } });
    await prisma.tripEvent.create({ data: { tripId: completedTrip.id, studentId: student.id, type: "alight", method: "nfc", timestamp: endedAt } });
  }

  // ---- Sample resolved alert ----
  await prisma.alert.create({
    data: {
      schoolId: noor.id, busId: bus1.id, type: "delay", priority: "notice", status: "resolved",
      message: "تأخر الباص 10 دقائق بسبب الازدحام", resolvedAt: new Date(), resolutionReason: "تم إبلاغ أولياء الأمور",
    },
  });

  // ---- Print + write credentials ----
  const lines = [
    "# Aman School — Seeded Demo Credentials",
    "",
    "Generated by `prisma/seed.ts`. Use these to log into each of the 6 roles.",
    "",
    "## Owner",
    `- email: \`owner@amanschool.ye\` / password: \`Owner@12345\``,
    "",
    "## Partner (شريك اليمن)",
    `- email: \`partner@amanschool.ye\` / password: \`Partner@12345\` (partnerId: ${partner.id})`,
    "",
    "## School Admin",
    `- مدرسة النور (صنعاء): \`admin@noor.amanschool.ye\` / \`Admin@12345\``,
    `- مدرسة الأمل (عدن): \`admin@amal.amanschool.ye\` / \`Admin@12345\``,
    "",
    "## Operations Room",
    `- مدرسة النور: \`ops@noor.amanschool.ye\` / \`Ops@12345\``,
    "",
    "## Supervisors (employeeCode + PIN)",
    `- ${sup1.name}: employeeCode \`EMP-1001\`, PIN \`${sup1Pin}\` (bus 101)`,
    `- ${sup2.name}: employeeCode \`EMP-1002\`, PIN \`${sup2Pin}\` (bus 102)`,
    "",
    "## Parents (phone + OTP)",
    "Request an OTP with `POST /auth/parent/request-otp {phone}` — the dev server returns/logs `devOtp` since there's no real SMS gateway wired up.",
    ...parentDefs.map((p) => `- ${p.name}: \`${p.phone}\``),
    "",
    "## Student link codes (for Parent App \"Add Student\" flow)",
    ...noorStudents.map((s, i) => `- ${["سارة أحمد","محمد علي","علي حسن","حسن حسن","نورة سعد","يوسف فهد","فهد ناصر","ناصر عمر","عمر خالد","خالد وليد"][i]}: \`NOOR-2026-${String(i + 1).padStart(5, "0")}\``),
    `- لمى عبدالله (مدرسة الأمل — cross-tenant demo student): \`AMAL-2026-00001\``,
    "",
  ];
  writeFileSync(join(__dirname, "..", "SEED_CREDENTIALS.md"), lines.join("\n"), "utf8");
  console.log(lines.join("\n"));
  console.log("\nSeed complete. Credentials written to backend/SEED_CREDENTIALS.md");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
