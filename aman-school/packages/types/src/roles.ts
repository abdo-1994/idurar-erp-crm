import { z } from "zod";

/** The 8-level user hierarchy from docs/architecture/00-overview.md (v3.1 adds `driver`) */
export const RoleSchema = z.enum([
  "owner",
  "sysadmin",
  "partner",
  "school_admin",
  "ops_room",
  "supervisor",
  "parent",
  "driver",
]);
export type Role = z.infer<typeof RoleSchema>;

export const ROLE_LABELS_AR: Record<Role, string> = {
  owner: "مالك النظام",
  sysadmin: "مدير النظام",
  partner: "الشريك",
  school_admin: "مدير المدرسة",
  ops_room: "غرفة العمليات",
  supervisor: "المشرف",
  parent: "ولي الأمر",
  driver: "السائق",
};

/** JWT payload shape, see docs/architecture/01-multi-tenant-design.md */
export const JwtClaimsSchema = z.object({
  sub: z.string(),
  role: RoleSchema,
  schoolId: z.string().uuid().nullable(),
  partnerId: z.string().uuid().nullable(),
  tenantVersion: z.number().default(1),
  // owner-impersonate (§13): present only on a temporary impersonation token,
  // pointing back at the owner who started the session.
  impersonatedByUserId: z.string().uuid().nullable().optional(),
});
export type JwtClaims = z.infer<typeof JwtClaimsSchema>;
