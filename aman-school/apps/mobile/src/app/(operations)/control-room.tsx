import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Card, ScreenContainer, StatusPill, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";

/** OPS-01, adapted from the original 1920x1080 dark-mode control-room design
 * to a mobile-friendly dark layout — same live data, denser desktop-style
 * grid isn't practical on a phone screen. */
export default function ControlRoomScreen() {
  const router = useRouter();
  const { data: trips } = useQuery({ queryKey: ["active-trips"], queryFn: () => api.operations.activeTrips(), refetchInterval: 6000 });
  const { data: alerts } = useQuery({ queryKey: ["active-alerts"], queryFn: () => api.operations.alerts("active"), refetchInterval: 6000 });

  return (
    <ScreenContainer backgroundColor={colors.navy}>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{trips?.length ?? 0}</Text>
          <Text style={styles.statLabel}>رحلات جارية</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.redMid }]}>{alerts?.length ?? 0}</Text>
          <Text style={styles.statLabel}>تنبيهات نشطة</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => router.push("/(operations)/alerts")}>
        <Card style={{ backgroundColor: "rgba(255,255,255,0.06)" }} accentColor={colors.redMid}>
          <Text style={styles.linkTitle}>🔔 إدارة التنبيهات</Text>
        </Card>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(operations)/daily-report")}>
        <Card style={{ backgroundColor: "rgba(255,255,255,0.06)" }} accentColor={colors.blueMid}>
          <Text style={styles.linkTitle}>📊 تقرير اليوم</Text>
        </Card>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(operations)/communications")}>
        <Card style={{ backgroundColor: "rgba(255,255,255,0.06)" }} accentColor={colors.tealMid}>
          <Text style={styles.linkTitle}>💬 التواصل</Text>
        </Card>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>الرحلات الجارية الآن</Text>
      {trips?.map((t: any) => (
        <Card key={t.id} style={{ backgroundColor: "rgba(255,255,255,0.06)" }} accentColor={colors.greenMid}>
          <View style={styles.row}>
            <Text style={styles.tripText}>باص {t.bus?.busNumber}</Text>
            <StatusPill label="جارية" tone="success" />
          </View>
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  stat: { flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, alignItems: "center" },
  statValue: { fontSize: 28, fontWeight: "800", color: colors.greenMid },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  linkTitle: { color: colors.white, fontWeight: "700" },
  sectionTitle: { color: colors.white, fontWeight: "700", fontSize: 13, marginTop: 12, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tripText: { color: colors.white, fontWeight: "600" },
});
