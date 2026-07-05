import { Text, View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Card, ScreenContainer, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";

const LINKS = [
  { href: "/(owner)/schools", label: "المدارس", icon: "🏫" },
  { href: "/(owner)/partners", label: "الشركاء", icon: "🤝" },
  { href: "/(owner)/packages", label: "الباقات", icon: "📦" },
  { href: "/(owner)/revenue", label: "الإيرادات", icon: "💰" },
  { href: "/(owner)/analytics", label: "التحليلات", icon: "📈" },
  { href: "/(owner)/settings", label: "الإعدادات", icon: "⚙️" },
];

export default function OwnerDashboardScreen() {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["owner-platform-summary"],
    queryFn: () => api.owner.platformSummary() as Promise<{
      totalSchools: number; activeSchools: number; totalStudents: number; monthlyRevenue: number;
    }>,
  });

  return (
    <ScreenContainer>
      <View style={styles.statsGrid}>
        {[
          { label: "إجمالي المدارس", value: data?.totalSchools },
          { label: "مدارس نشطة", value: data?.activeSchools },
          { label: "الطلاب النشطون", value: data?.totalStudents },
          { label: "الإيراد الشهري", value: data ? `${data.monthlyRevenue} ر.س` : undefined },
        ].map((s) => (
          <Card key={s.label} style={styles.statCard}>
            <Text style={styles.statValue}>{s.value ?? "-"}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Card>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.linksGrid}>
        {LINKS.map((l) => (
          <Card key={l.href} style={styles.linkCard} accentColor={colors.purpleMid}>
            <Text style={styles.linkIcon} onPress={() => router.push(l.href as never)}>{l.icon}</Text>
            <Text style={styles.linkLabel} onPress={() => router.push(l.href as never)}>{l.label}</Text>
          </Card>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  statCard: { width: "47%", alignItems: "center", paddingVertical: 16 },
  statValue: { fontSize: 20, fontWeight: "800", color: colors.purpleMid },
  statLabel: { fontSize: 11, color: colors.gray600, marginTop: 4 },
  linksGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  linkCard: { width: "31%", alignItems: "center", paddingVertical: 16 },
  linkIcon: { fontSize: 24 },
  linkLabel: { fontSize: 11, color: colors.navy, fontWeight: "700", marginTop: 6, textAlign: "center" },
});
