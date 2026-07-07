import { Text, View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Card, ScreenContainer, StatusPill, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";

const LINKS = [
  { href: "/(sysadmin)/users", label: "المستخدمون", icon: "👥" },
  { href: "/(sysadmin)/roles", label: "الأدوار", icon: "🔐" },
  { href: "/(sysadmin)/servers", label: "الخوادم", icon: "🖥️" },
  { href: "/(sysadmin)/logs", label: "السجلات", icon: "📜" },
  { href: "/(sysadmin)/backup", label: "النسخ الاحتياطي", icon: "💾" },
  { href: "/(sysadmin)/security", label: "الأمان", icon: "🛡️" },
  { href: "/(sysadmin)/config", label: "الإعدادات", icon: "⚙️" },
];

type Dashboard = {
  services: { apiServer: boolean; database: boolean; webSocket: boolean };
  uptimeSeconds: number;
  dbLatencyMs: number;
  last24h: { requests: number; errors: number; avgResponseMs: number; errorRatePct: number };
  totals: { users: number; schools: number; buses: number };
};

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h} س ${m} د`;
}

export default function SysadminDashboardScreen() {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["sysadmin-dashboard"],
    queryFn: () => api.sysadmin.dashboard() as Promise<Dashboard>,
    refetchInterval: 15000,
  });

  return (
    <ScreenContainer>
      <View style={styles.servicesRow}>
        <StatusPill label={`API ${data?.services.apiServer ? "يعمل" : "متوقف"}`} tone={data?.services.apiServer ? "success" : "danger"} />
        <StatusPill label={`قاعدة البيانات ${data?.services.database ? "تعمل" : "متوقفة"}`} tone={data?.services.database ? "success" : "danger"} />
        <StatusPill label={`WebSocket ${data?.services.webSocket ? "يعمل" : "متوقف"}`} tone={data?.services.webSocket ? "success" : "danger"} />
      </View>

      <View style={styles.statsGrid}>
        {[
          { label: "وقت التشغيل", value: data ? formatUptime(data.uptimeSeconds) : undefined },
          { label: "زمن استجابة قاعدة البيانات", value: data ? `${data.dbLatencyMs} مللي‌ثانية` : undefined },
          { label: "طلبات آخر 24 ساعة", value: data?.last24h.requests },
          { label: "معدل الأخطاء", value: data ? `${data.last24h.errorRatePct}%` : undefined },
          { label: "إجمالي المستخدمين", value: data?.totals.users },
          { label: "إجمالي المدارس", value: data?.totals.schools },
        ].map((s) => (
          <Card key={s.label} style={styles.statCard}>
            <Text style={styles.statValue}>{s.value ?? "-"}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Card>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.linksGrid}>
        {LINKS.map((l) => (
          <Card key={l.href} style={styles.linkCard} accentColor={colors.navy}>
            <Text style={styles.linkIcon} onPress={() => router.push(l.href as never)}>{l.icon}</Text>
            <Text style={styles.linkLabel} onPress={() => router.push(l.href as never)}>{l.label}</Text>
          </Card>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  servicesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  statCard: { width: "47%", alignItems: "center", paddingVertical: 16 },
  statValue: { fontSize: 18, fontWeight: "800", color: colors.navy },
  statLabel: { fontSize: 11, color: colors.gray600, marginTop: 4, textAlign: "center" },
  linksGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  linkCard: { width: "31%", alignItems: "center", paddingVertical: 16 },
  linkIcon: { fontSize: 24 },
  linkLabel: { fontSize: 11, color: colors.navy, fontWeight: "700", marginTop: 6, textAlign: "center" },
});
