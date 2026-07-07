import type { Role } from "@aman-school/types";

/** Where each role lands after login/consent — shared by index.tsx and consent.tsx. */
export const ROLE_HOME: Record<Role, string> = {
  supervisor: "/(supervisor)/trip-select",
  parent: "/(parent)/home",
  school_admin: "/(school)/dashboard",
  ops_room: "/(operations)/control-room",
  owner: "/(owner)/dashboard",
  partner: "/(owner)/partner-dashboard",
  sysadmin: "/(sysadmin)/dashboard",
  driver: "/(driver)/home",
};
