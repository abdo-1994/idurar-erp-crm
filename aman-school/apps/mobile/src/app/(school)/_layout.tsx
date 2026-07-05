import { Stack } from "expo-router";
import { colors } from "@aman-school/shared-ui";
import { RoleGuardLayout } from "../../features/shared/RoleGuardLayout";

export default function SchoolLayout() {
  return (
    <RoleGuardLayout allow={["school_admin"]}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.amber },
          headerTintColor: colors.white,
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen name="dashboard" options={{ title: "لوحة المدرسة" }} />
        <Stack.Screen name="students" options={{ title: "إدارة الطلاب" }} />
        <Stack.Screen name="student/[id]" options={{ title: "تفاصيل الطالب" }} />
        <Stack.Screen name="buses" options={{ title: "إدارة الباصات" }} />
        <Stack.Screen name="supervisors" options={{ title: "إدارة المشرفين" }} />
        <Stack.Screen name="routes" options={{ title: "إدارة المسارات" }} />
        <Stack.Screen name="live-trips" options={{ title: "متابعة الرحلات المباشرة" }} />
        <Stack.Screen name="reports" options={{ title: "التقارير والإحصائيات" }} />
        <Stack.Screen name="alerts" options={{ title: "التنبيهات والإشعارات" }} />
        <Stack.Screen name="settings" options={{ title: "إعدادات المدرسة" }} />
      </Stack>
    </RoleGuardLayout>
  );
}
