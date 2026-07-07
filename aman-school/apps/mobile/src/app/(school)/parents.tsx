import { Text, View, StyleSheet, FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Card, EmptyState, ScreenContainer, StatusPill, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/session";

type SchoolParent = {
  id: string; name: string; phone: string | null;
  subscriptionTier: string | null; subscriptionEndsAt: string | null;
  children: Array<{ id: string; name: string; grade: string }>;
};

/* ---- A-9: parents/guardians of this school's students ---- */
export default function SchoolParentsScreen() {
  const schoolId = useSessionStore((s) => s.user?.schoolId)!;
  const { data: parents } = useQuery({
    queryKey: ["school-parents", schoolId],
    queryFn: () => api.school.parents(schoolId) as Promise<SchoolParent[]>,
  });

  return (
    <ScreenContainer>
      <FlatList
        data={parents}
        keyExtractor={(p) => p.id}
        scrollEnabled={false}
        ListEmptyComponent={<EmptyState icon="👨‍👩‍👦" title="لا يوجد أولياء أمور مسجّلون" />}
        renderItem={({ item }) => (
          <Card accentColor={colors.amber}>
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              {item.subscriptionTier ? <StatusPill label={item.subscriptionTier} tone="success" /> : <StatusPill label="بدون اشتراك" tone="neutral" />}
            </View>
            <Text style={styles.meta}>{item.phone ?? "—"}</Text>
            <Text style={styles.meta}>
              الأبناء: {item.children.map((c) => `${c.name} (${c.grade})`).join("، ")}
            </Text>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontWeight: "700", color: colors.navy, fontSize: 14 },
  meta: { color: colors.gray600, fontSize: 12, marginTop: 4 },
});
