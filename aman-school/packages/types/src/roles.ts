import { z } from "zod";

/** The 6-level user hierarchy from docs/architecture/00-overview.md */
export const RoleSchema = z.enum([
  "owner",
  "partner",
  "school_admin",
  "ops_room",
  "supervisor",
  "parent",
]);
export type Role = z.infer<typeof RoleSchema>;

export const ROLE_LABELS_AR: Record<Role, string> = {
  owner: "مالك النظام",
  partner: "الشريك",
  school_admin: "مدير المدرسة",
  ops_room: "غرفة العمليات",
  supervisor: "المشرف",
  parent: "ولي الأمر",
};

/** JWT payload shape, see docs/architecture/01-multi-tenant-design.md */
export const JwtClaimsSchema = z.object({
  sub: z.string(),
  role: RoleSchema,
  schoolId: z.string().uuid().nullable(),
  partnerId: z.string().uuid().nullable(),
  tenantVersion: z.number().default(1),
});
export type JwtClaims = z.infer<typeof JwtClaimsSchema>;
