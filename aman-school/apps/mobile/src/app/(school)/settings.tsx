import { useEffect, useState } from "react";
import { Text, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, ScreenContainer, SectionHeader, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/session";
import { useLogout } from "../../features/shared/RoleGuardLayout";

/** SCH-11: school profile settings + subscription info + logout. */
export default function SchoolSettingsScreen() {
  const router = useRouter();
  const logout = useLogout();
  const schoolId = useSessionStore((s) => s.user?.schoolId)!;

  const { data: school } = useQuery({ queryKey: ["school-detail", schoolId], queryFn: () => api.school.get(schoolId) });
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (school) {
      setName(school.name);
      setAddress(school.address ?? "");
    }
  }, [school]);

  const saveMutation = useMutation({
    mutationFn: () => api.school.updateSettings(schoolId, { name, address }),
    onSuccess: () => Alert.alert("تم الحفظ", "تم حفظ بيانات المدرسة"),
  });

  return (
    <ScreenContainer>
      <SectionHeader title="بيانات المدرسة" accentColor={colors.amber} />
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="اسم المدرسة" />
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="العنوان" />
      <Button title="حفظ" onPress={() => saveMutation.mutate()} loading={saveMutation.isPending} color={colors.amber} />

      <SectionHeader title="الاشتراك" accentColor={colors.amber} />
      <Card>
        <Text style={styles.subLabel}>الباقة الحالية: {(school as any)?.package?.name ?? "-"}</Text>
        <Text style={styles.subLabel}>الحالة: {school?.subscriptionStatus ?? "-"}</Text>
      </Card>

      <Button
        title="تسجيل الخروج"
        color={colors.red}
        onPress={async () => {
          await logout();
          router.replace("/(auth)/role-select");
        }}
      />
    </ScreenContainer>
  );
}

const styles = {
  input: {
    borderWidth: 1 as const, borderColor: colors.gray200, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 14, backgroundColor: colors.white, marginBottom: 8,
  },
  subLabel: { fontSize: 13, color: colors.gray700, marginBottom: 4 },
};
