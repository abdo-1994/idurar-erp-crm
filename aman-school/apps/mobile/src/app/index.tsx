import { Redirect } from "expo-router";
import { useSessionStore } from "../store/session";
import { ROLE_HOME } from "../features/shared/roleHome";

export default function Index() {
  const user = useSessionStore((s) => s.user);
  if (!user) return <Redirect href="/(auth)/role-select" />;
  return <Redirect href={(ROLE_HOME[user.role] ?? "/(auth)/role-select") as never} />;
}
