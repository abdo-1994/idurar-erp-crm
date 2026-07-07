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

export default function SysadminLayout() {
  return (
    <RoleGuardLayout allow={["sysadmin", "owner"]}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.navy },
          headerTintColor: colors.white,
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen name="dashboard" options={{ title: "لوحة مدير النظام", headerRight: LogoutHeaderButton }} />
        <Stack.Screen name="users" options={{ title: "إدارة المستخدمين" }} />
        <Stack.Screen name="roles" options={{ title: "الأدوار والصلاحيات" }} />
        <Stack.Screen name="servers" options={{ title: "حالة الخوادم" }} />
        <Stack.Screen name="logs" options={{ title: "سجلات النظام" }} />
        <Stack.Screen name="backup" options={{ title: "النسخ الاحتياطي" }} />
        <Stack.Screen name="security" options={{ title: "إعدادات الأمان" }} />
        <Stack.Screen name="config" options={{ title: "الإعدادات التقنية" }} />
      </Stack>
    </RoleGuardLayout>
  );
}
