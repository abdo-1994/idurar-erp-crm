import { Text, View, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Card, ScreenContainer, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/session";

export default function PartnerDashboardScreen() {
  const user = useSessionStore((s) => s.user)!;
  const { data } = useQuery({
    queryKey: ["partner-dashboard", user.partnerId],
    queryFn: () => api.partner.dashboard(user.partnerId!) as Promise<{
      partner: { name: string; region: string; schools: any[] };
      monthlyRevenue: number; commission: number; schoolsCount: number;
    }>,
    enabled: !!user.partnerId,
  });

  return (
    <ScreenContainer>
      <Card accentColor={colors.orangeMid}>
        <Text style={styles.title}>{data?.partner?.name}</Text>
        <Text style={styles.meta}>{data?.partner?.region}</Text>
      </Card>
      <Card>
        <View style={styles.row}><Text style={styles.label}>عدد المدارس</Text><Text style={styles.value}>{data?.schoolsCount ?? "-"}</Text></View>
        <View style={styles.row}><Text style={styles.label}>الإيراد الشهري لمدارسه</Text><Text style={styles.value}>{data?.monthlyRevenue ?? "-"} ر.س</Text></View>
        <View style={styles.row}><Text style={styles.label}>عمولته الشهرية</Text><Text style={styles.value}>{data?.commission ?? "-"} ر.س</Text></View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: "800", color: colors.orangeMid },
  meta: { color: colors.gray600, fontSize: 12, marginTop: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  label: { color: colors.gray600, fontSize: 13 },
  value: { color: colors.navy, fontWeight: "700", fontSize: 13 },
});
