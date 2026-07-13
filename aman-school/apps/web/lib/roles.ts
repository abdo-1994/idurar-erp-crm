import type { Role } from "@aman-school/types";

/** Desk-job roles this web dashboard serves — field roles (parent/
 * supervisor/driver) stay mobile-only, matching how the product is actually
 * used day to day. */
export type WebRole = "owner" | "school_admin" | "ops_room" | "sysadmin" | "partner";

export const WEB_ROLES: WebRole[] = ["owner", "school_admin", "ops_room", "partner", "sysadmin"];

export const WEB_ROLE_LABELS: Record<WebRole, string> = {
  owner: "مالك النظام",
  school_admin: "مدير المدرسة",
  ops_room: "غرفة العمليات",
  partner: "الشريك",
  sysadmin: "مدير النظام",
};

export const WEB_ROLE_DESCRIPTIONS: Record<WebRole, string> = {
  owner: "SaaS، إيرادات، مدارس، ميزات تجريبية",
  school_admin: "إدارة الطلاب والباصات والمشرفين",
  ops_room: "مراقبة حية وإدارة الأزمات",
  partner: "المدارس، العمولات، التسويق",
  sysadmin: "بنية النظام، السجلات، الأمان",
};

export const WEB_ROLE_HOME: Record<WebRole, string> = {
  owner: "/owner",
  school_admin: "/school",
  ops_room: "/operations",
  partner: "/partner",
  sysadmin: "/sysadmin",
};

export function isWebRole(role: Role): role is WebRole {
  return (WEB_ROLES as string[]).includes(role);
}
