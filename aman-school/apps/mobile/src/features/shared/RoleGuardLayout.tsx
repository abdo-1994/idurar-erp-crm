import { PropsWithChildren } from "react";
import { Redirect } from "expo-router";
import type { Role } from "@aman-school/types";
import { useSessionStore } from "../../store/session";

/** Wrap every role route-group's _layout with this so each role's screens are
 * fully independent — a session for a different role (or no session at all)
 * bounces back to the role picker instead of ever rendering this group's UI. */
export function RoleGuardLayout({ allow, children }: PropsWithChildren<{ allow: Role[] }>) {
  const user = useSessionStore((s) => s.user);
  if (!user || !allow.includes(user.role)) {
    return <Redirect href="/(auth)/role-select" />;
  }
  return <>{children}</>;
}

export function useLogout() {
  const clear = useSessionStore((s) => s.clear);
  return clear;
}
