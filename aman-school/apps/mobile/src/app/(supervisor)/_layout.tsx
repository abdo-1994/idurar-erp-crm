import { Text, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { colors } from "@aman-school/shared-ui";
import { RoleGuardLayout } from "../../features/shared/RoleGuardLayout";

function SettingsHeaderButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push("/(supervisor)/settings")} hitSlop={10}>
      <Text style={{ color: colors.white, fontSize: 20 }}>⚙️</Text>
    </TouchableOpacity>
  );
}

export default function SupervisorLayout() {
  return (
    <RoleGuardLayout allow={["supervisor"]}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.blueMid },
          headerTintColor: colors.white,
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen name="trip-select" options={{ title: "اختيار الرحلة", headerRight: SettingsHeaderButton }} />
        <Stack.Screen name="student-list" options={{ title: "قائمة الطلاب" }} />
        <Stack.Screen name="scan" options={{ title: "مسح الطلاب", headerBackVisible: false }} />
        <Stack.Screen name="manual-entry" options={{ title: "إدخال يدوي" }} />
        <Stack.Screen name="live-status" options={{ title: "حالة الرحلة" }} />
        <Stack.Screen name="exception" options={{ title: "تسجيل حالة استثنائية" }} />
        <Stack.Screen name="end-trip" options={{ title: "إنهاء الرحلة" }} />
        <Stack.Screen name="report" options={{ title: "تقرير الرحلة" }} />
        <Stack.Screen name="sos" options={{ title: "طوارئ", presentation: "modal" }} />
        <Stack.Screen name="notifications" options={{ title: "الإشعارات" }} />
        <Stack.Screen name="settings" options={{ title: "الإعدادات" }} />
        <Stack.Screen name="verify-pickup/[studentId]" options={{ title: "تأكيد هوية المستلم" }} />
        <Stack.Screen name="not-collected/[studentId]" options={{ title: "لم يُستلم الطالب", headerBackVisible: false }} />
        <Stack.Screen name="medical-alert/[studentId]" options={{ title: "طوارئ طبية" }} />
        <Stack.Screen name="profile" options={{ title: "حسابي" }} />
        <Stack.Screen name="contact" options={{ title: "الدعم الفني" }} />
      </Stack>
    </RoleGuardLayout>
  );
}
