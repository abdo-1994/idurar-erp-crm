import { Stack } from "expo-router";
import { colors } from "@aman-school/shared-ui";
import { RoleGuardLayout } from "../../features/shared/RoleGuardLayout";

export default function DriverLayout() {
  return (
    <RoleGuardLayout allow={["driver"]}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.tealMid },
          headerTintColor: colors.white,
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ title: "الإشعارات" }} />
        <Stack.Screen name="profile" options={{ title: "حسابي" }} />
        <Stack.Screen name="settings" options={{ title: "الإعدادات" }} />
        <Stack.Screen name="contact" options={{ title: "الدعم الفني" }} />
      </Stack>
    </RoleGuardLayout>
  );
}
