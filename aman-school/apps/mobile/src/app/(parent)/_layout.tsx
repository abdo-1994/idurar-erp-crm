import { Text, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { colors } from "@aman-school/shared-ui";
import { RoleGuardLayout } from "../../features/shared/RoleGuardLayout";
import { useLogout } from "../../features/shared/RoleGuardLayout";

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

export default function ParentLayout() {
  return (
    <RoleGuardLayout allow={["parent"]}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.greenMid },
          headerTintColor: colors.white,
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen name="home" options={{ title: "أمان سكول", headerRight: LogoutHeaderButton }} />
        <Stack.Screen name="add-student" options={{ title: "إضافة ابن" }} />
        <Stack.Screen name="child/[id]" options={{ title: "تفاصيل الابن" }} />
        <Stack.Screen name="tracking/[busId]" options={{ title: "التتبع المباشر" }} />
        <Stack.Screen name="trip-history/[id]" options={{ title: "سجل الرحلات" }} />
        <Stack.Screen name="notifications" options={{ title: "الإشعارات" }} />
        <Stack.Screen name="notification-settings" options={{ title: "إعدادات الإشعارات" }} />
        <Stack.Screen name="contact" options={{ title: "التواصل والدعم" }} />
        <Stack.Screen name="subscription" options={{ title: "الاشتراك والدفع" }} />
        <Stack.Screen name="profile" options={{ title: "حسابي" }} />
      </Stack>
    </RoleGuardLayout>
  );
}
