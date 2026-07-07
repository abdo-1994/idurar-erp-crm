import { useState } from "react";
import { Text, TextInput, View, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, EmptyState, ErrorState, LoadingState, ScreenContainer, SectionHeader, StatusPill, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/session";

/* ---- D-02 / d-home: driver's assigned bus, breakdown reporting, SOS ---- */
export default function DriverHomeScreen() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user)!;
  const queryClient = useQueryClient();
  const [breakdownNotes, setBreakdownNotes] = useState("");
  const [sending, setSending] = useState(false);

  const {
    data: bus,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useQuery({ queryKey: ["driver-my-bus"], queryFn: () => api.driver.myBus() as Promise<any | null> });

  const breakdownMutation = useMutation({
    mutationFn: () => api.driver.reportBreakdown(bus!.id, breakdownNotes),
    onSuccess: () => {
      Alert.alert("تم الإبلاغ", "تم إرسال بلاغ العطل لإدارة المدرسة");
      setBreakdownNotes("");
      queryClient.invalidateQueries({ queryKey: ["driver-my-bus"] });
    },
    onError: () => Alert.alert("تعذر الإرسال", "تحقق من الاتصال بالإنترنت وحاول مرة أخرى"),
  });

  async function sendSos() {
    setSending(true);
    try {
      let lat = 12.7855;
      let lng = 45.0187;
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
      await api.driver.sos({ tripId: null, lat, lng, description: "طوارئ من السائق" });
      Alert.alert("تم الإرسال", "تم إرسال تنبيه الطوارئ لغرفة العمليات مع موقعك");
    } catch {
      Alert.alert("تعذر الإرسال", "تحقق من الاتصال بالإنترنت أو اتصل مباشرة بغرفة العمليات");
    } finally {
      setSending(false);
    }
  }

  function confirmSos() {
    Alert.alert("هل أنت في حالة طوارئ؟", "سيتم إرسال موقعك فوراً لغرفة العمليات", [
      { text: "إلغاء", style: "cancel" },
      { text: "نعم، أرسل الآن", style: "destructive", onPress: sendSos },
    ]);
  }

  return (
    <ScreenContainer refreshing={isRefetching} onRefresh={refetch}>
      <Text style={styles.greeting}>مرحباً، {user.name} 👋</Text>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !bus ? (
        <EmptyState icon="🚌" title="لا يوجد باص مخصص لك حالياً" subtitle="تواصل مع إدارة المدرسة" />
      ) : (
        <Card accentColor={bus.outOfService ? colors.red : colors.tealMid}>
          <View style={styles.row}>
            <Text style={styles.busName}>باص {bus.busNumber}</Text>
            <StatusPill label={bus.outOfService ? "خارج الخدمة" : "بالخدمة"} tone={bus.outOfService ? "danger" : "success"} />
          </View>
          <Text style={styles.meta}>{bus.plateNumber} · السعة {bus.capacity}</Text>
          {bus.inspectionExpiresAt ? (
            <Text style={styles.meta}>الفحص الفني ينتهي: {new Date(bus.inspectionExpiresAt).toLocaleDateString("ar-YE")}</Text>
          ) : null}
          {bus.insuranceExpiresAt ? (
            <Text style={styles.meta}>التأمين ينتهي: {new Date(bus.insuranceExpiresAt).toLocaleDateString("ar-YE")}</Text>
          ) : null}
        </Card>
      )}

      {bus ? (
        <Card>
          <SectionHeader title="الإبلاغ عن عطل طارئ" accentColor={colors.amber} />
          <TextInput
            style={styles.input}
            value={breakdownNotes}
            onChangeText={setBreakdownNotes}
            placeholder="صف العطل (مثال: عطل في الفرامل)"
            multiline
          />
          <Button
            title="🔧 إرسال بلاغ عطل"
            onPress={() => breakdownMutation.mutate()}
            loading={breakdownMutation.isPending}
            disabled={!breakdownNotes}
            color={colors.amber}
          />
          <View style={{ height: 8 }} />
          <Button title="📋 سجل الصيانة" variant="outline" onPress={() => router.push(`/(driver)/profile`)} />
        </Card>
      ) : null}

      <Card accentColor={colors.red}>
        <SectionHeader title="طوارئ" accentColor={colors.red} />
        <Button title="🆘 إرسال تنبيه طوارئ SOS" color={colors.red} onPress={confirmSos} loading={sending} />
      </Card>

      <Button title="🔔 الإشعارات" variant="outline" onPress={() => router.push("/(driver)/notifications")} />
      <Button title="👤 حسابي" variant="outline" onPress={() => router.push("/(driver)/profile")} />
      <Button title="⚙️ الإعدادات" variant="outline" onPress={() => router.push("/(driver)/settings")} />
      <Button title="💬 الدعم الفني" variant="outline" onPress={() => router.push("/(driver)/contact")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greeting: { fontSize: 18, fontWeight: "800", color: colors.navy, marginBottom: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  busName: { fontWeight: "800", color: colors.navy, fontSize: 15 },
  meta: { color: colors.gray600, fontSize: 12, marginTop: 6 },
  input: {
    borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 14, backgroundColor: colors.white, marginBottom: 10, minHeight: 60, textAlignVertical: "top",
  },
});
