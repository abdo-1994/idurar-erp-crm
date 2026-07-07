import { Redirect } from "expo-router";
import { useSessionStore } from "../store/session";

const ROLE_HOME: Record<string, string> = {
  supervisor: "/(supervisor)/trip-select",
  parent: "/(parent)/home",
  school_admin: "/(school)/dashboard",
  ops_room: "/(operations)/control-room",
  owner: "/(owner)/dashboard",
  partner: "/(owner)/partner-dashboard",
};

export default function Index() {
  const user = useSessionStore((s) => s.user);
  if (!user) return <Redirect href="/(auth)/role-select" />;
  return <Redirect href={(ROLE_HOME[user.role] ?? "/(auth)/role-select") as never} />;
}
