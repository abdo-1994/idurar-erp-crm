import { Text, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { colors } from "@aman-school/shared-ui";
import { RoleGuardLayout, useLogout } from "../../features/shared/RoleGuardLayout";

function LogoutHeaderButton() {
  const router = useRouter();
  const logout = useLogout();
  return (
    <TouchableOpacity
      hitSlop={10}
      onPress={async () => {
        await logout();
        router.replace("/(auth)/role-select");
      }}
    >
      <Text style={{ color: colors.white, fontSize: 13, fontWeight: "700" }}>خروج</Text>
    </TouchableOpacity>
  );
}

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
        <Stack.Screen name="home" options={{ title: "أمان سكول — السائق", headerRight: LogoutHeaderButton }} />
        <Stack.Screen name="notifications" options={{ title: "الإشعارات" }} />
        <Stack.Screen name="profile" options={{ title: "حسابي" }} />
        <Stack.Screen name="settings" options={{ title: "الإعدادات" }} />
        <Stack.Screen name="contact" options={{ title: "الدعم الفني" }} />
      </Stack>
    </RoleGuardLayout>
  );
}
