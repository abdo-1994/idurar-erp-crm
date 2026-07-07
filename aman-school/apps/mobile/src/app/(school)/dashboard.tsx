import { Text, View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Card, ScreenContainer, SubscriptionBanner, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/session";

const LINKS = [
  { href: "/(school)/students", label: "الطلاب", icon: "🎒" },
  { href: "/(school)/parents", label: "أولياء الأمور", icon: "👨‍👩‍👦" },
  { href: "/(school)/buses", label: "الباصات", icon: "🚌" },
  { href: "/(school)/supervisors", label: "المشرفون", icon: "👮" },
  { href: "/(school)/drivers", label: "السائقون", icon: "🚌" },
  { href: "/(school)/calendar", label: "التقويم والعطل", icon: "📅" },
  { href: "/(school)/live-trips", label: "الرحلات المباشرة", icon: "🗺️" },
  { href: "/(school)/reports", label: "التقارير", icon: "📊" },
  { href: "/(school)/alerts", label: "التنبيهات", icon: "🔔" },
  { href: "/(school)/routes", label: "المسارات", icon: "🛣️" },
  { href: "/(school)/invoices", label: "الفواتير", icon: "🧾" },
  { href: "/(school)/payment-status", label: "حالة الدفع", icon: "💳" },
  { href: "/(school)/settings", label: "الإعدادات", icon: "⚙️" },
];

export default function SchoolDashboardScreen() {
  const router = useRouter();
  const schoolId = useSessionStore((s) => s.user?.schoolId)!;
  const { data } = useQuery({
    queryKey: ["school-dashboard", schoolId],
    queryFn: () => api.school.dashboardSummary(schoolId) as Promise<{
      activeTripsCount: number; todayTripsTotal: number; todayTripsCompleted: number;
      studentsOnTheWay: number; totalStudents: number; totalBuses: number;
    }>,
  });
  const { data: school } = useQuery({ queryKey: ["school-info", schoolId], queryFn: () => api.school.get(schoolId) as Promise<any> });

  return (
    <ScreenContainer>
      <SubscriptionBanner status={school?.subscriptionStatus} endsAt={school?.subscriptionEndsAt} gracePeriodEndsAt={school?.gracePeriodEndsAt} />

      <View style={styles.statsGrid}>
        {[
          { label: "رحلات نشطة", value: data?.activeTripsCount },
          { label: "طلاب في الطريق", value: data?.studentsOnTheWay },
          { label: "إجمالي الطلاب", value: data?.totalStudents },
          { label: "إجمالي الباصات", value: data?.totalBuses },
        ].map((s) => (
          <Card key={s.label} style={styles.statCard}>
            <Text style={styles.statValue}>{s.value ?? "-"}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Card>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.linksGrid}>
        {LINKS.map((l) => (
          <Card key={l.href} style={styles.linkCard} accentColor={colors.amber}>
            <Text style={styles.linkIcon} onPress={() => router.push(l.href as never)}>
              {l.icon}
            </Text>
            <Text style={styles.linkLabel} onPress={() => router.push(l.href as never)}>
              {l.label}
            </Text>
          </Card>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  statCard: { width: "47%", alignItems: "center", paddingVertical: 16 },
  statValue: { fontSize: 22, fontWeight: "800", color: colors.amber },
  statLabel: { fontSize: 11, color: colors.gray600, marginTop: 4 },
  linksGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  linkCard: { width: "31%", alignItems: "center", paddingVertical: 16 },
  linkIcon: { fontSize: 24 },
  linkLabel: { fontSize: 11, color: colors.navy, fontWeight: "700", marginTop: 6, textAlign: "center" },
});
