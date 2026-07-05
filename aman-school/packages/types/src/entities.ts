import { z } from "zod";

export const SubscriptionStatusSchema = z.enum(["active", "suspended", "expired", "trial"]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const PackageSchema = z.object({
  id: z.string().uuid(),
  name: z.string(), // "أساسي" | "متقدم" | "شامل"
  priceMonthly: z.number(),
  studentLimit: z.number(),
  features: z.array(z.string()),
});
export type Package = z.infer<typeof PackageSchema>;

export const PartnerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  region: z.string(),
  commissionPercent: z.number(),
  createdAt: z.string().datetime(),
});
export type Partner = z.infer<typeof PartnerSchema>;

export const SchoolSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(), // used as student-code prefix, e.g. "SCHOOL"
  name: z.string(),
  address: z.string().nullable(),
  logoUrl: z.string().nullable(),
  packageId: z.string().uuid().nullable(),
  partnerId: z.string().uuid().nullable(),
  subscriptionStatus: SubscriptionStatusSchema,
  createdAt: z.string().datetime(),
});
export type School = z.infer<typeof SchoolSchema>;

export const StopSchema = z.object({
  id: z.string().uuid(),
  routeId: z.string().uuid(),
  order: z.number(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
});
export type Stop = z.infer<typeof StopSchema>;

export const RouteSchema = z.object({
  id: z.string().uuid(),
  schoolId: z.string().uuid(),
  busId: z.string().uuid(),
  stops: z.array(StopSchema),
});
export type RouteEntity = z.infer<typeof RouteSchema>;

export const BusSchema = z.object({
  id: z.string().uuid(),
  schoolId: z.string().uuid(),
  busNumber: z.string(),
  plateNumber: z.string(),
  capacity: z.number(),
  supervisorId: z.string().uuid().nullable(),
  gpsDeviceId: z.string().nullable(),
});
export type Bus = z.infer<typeof BusSchema>;

export const StudentStatusSchema = z.enum(["active", "suspended"]);

export const StudentSchema = z.object({
  id: z.string().uuid(),
  schoolId: z.string().uuid(),
  code: z.string(), // SCHOOL-2026-XXXXX
  name: z.string(),
  grade: z.string(),
  photoUrl: z.string().nullable(),
  busId: z.string().uuid().nullable(),
  stopId: z.string().uuid().nullable(),
  status: StudentStatusSchema,
});
export type Student = z.infer<typeof StudentSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["owner", "partner", "school_admin", "ops_room", "supervisor", "parent"]),
  name: z.string(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  schoolId: z.string().uuid().nullable(),
  partnerId: z.string().uuid().nullable(),
  employeeCode: z.string().nullable(), // supervisor login
});
export type User = z.infer<typeof UserSchema>;

export const TripDirectionSchema = z.enum(["to_school", "to_home"]);
export const TripStatusSchema = z.enum(["scheduled", "active", "completed", "cancelled"]);

export const TripSchema = z.object({
  id: z.string().uuid(),
  schoolId: z.string().uuid(),
  busId: z.string().uuid(),
  supervisorId: z.string().uuid().nullable(),
  direction: TripDirectionSchema,
  status: TripStatusSchema,
  scheduledAt: z.string().datetime(),
  startedAt: z.string().datetime().nullable(),
  endedAt: z.string().datetime().nullable(),
});
export type Trip = z.infer<typeof TripSchema>;

export const TripEventTypeSchema = z.enum(["board", "alight"]);
export const TripEventMethodSchema = z.enum(["nfc", "manual"]);

export const TripEventSchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  studentId: z.string().uuid(),
  type: TripEventTypeSchema,
  method: TripEventMethodSchema,
  manualReason: z.string().nullable(),
  timestamp: z.string().datetime(),
});
export type TripEvent = z.infer<typeof TripEventSchema>;

export const AlertPrioritySchema = z.enum(["urgent_critical", "urgent", "notice"]);
export const AlertStatusSchema = z.enum(["active", "acknowledged", "resolved"]);
export const AlertTypeSchema = z.enum(["sos", "delay", "incident", "exception"]);

export const AlertSchema = z.object({
  id: z.string().uuid(),
  schoolId: z.string().uuid(),
  tripId: z.string().uuid().nullable(),
  busId: z.string().uuid().nullable(),
  type: AlertTypeSchema,
  priority: AlertPrioritySchema,
  status: AlertStatusSchema,
  message: z.string().nullable(),
  createdAt: z.string().datetime(),
  acknowledgedAt: z.string().datetime().nullable(),
  resolvedAt: z.string().datetime().nullable(),
});
export type Alert = z.infer<typeof AlertSchema>;

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  body: z.string(),
  type: z.string(),
  read: z.boolean(),
  createdAt: z.string().datetime(),
});
export type Notification = z.infer<typeof NotificationSchema>;

export const GpsPingSchema = z.object({
  busId: z.string().uuid(),
  lat: z.number(),
  lng: z.number(),
  speedKmh: z.number().nullable(),
  timestamp: z.string().datetime(),
});
export type GpsPing = z.infer<typeof GpsPingSchema>;
