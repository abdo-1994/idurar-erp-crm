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

export default function OperationsLayout() {
  return (
    <RoleGuardLayout allow={["ops_room", "school_admin", "owner", "partner"]}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.navy },
          headerTintColor: colors.white,
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen name="control-room" options={{ title: "غرفة العمليات", headerRight: LogoutHeaderButton }} />
        <Stack.Screen name="alerts" options={{ title: "إدارة التنبيهات" }} />
        <Stack.Screen name="incidents" options={{ title: "سجل الحوادث" }} />
        <Stack.Screen name="incident/[id]" options={{ title: "تفاصيل الحادثة" }} />
        <Stack.Screen name="communications" options={{ title: "التواصل" }} />
        <Stack.Screen name="daily-report" options={{ title: "تقرير اليوم" }} />
        <Stack.Screen name="profile" options={{ title: "حسابي" }} />
      </Stack>
    </RoleGuardLayout>
  );
}
