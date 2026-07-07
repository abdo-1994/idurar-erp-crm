import { Text, View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, EmptyState, ScreenContainer, StatusPill, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/session";

const STATUS_LABEL: Record<string, string> = { home: "في المنزل", on_the_way: "في الطريق", at_school: "في المدرسة" };
const STATUS_TONE: Record<string, "neutral" | "warning" | "success"> = { home: "neutral", on_the_way: "warning", at_school: "success" };

export default function ParentHomeScreen() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user)!;
  const { data: children, isLoading, refetch } = useQuery({
    queryKey: ["parent-children-status", user.id],
    queryFn: () => api.parent.childrenStatus(user.id),
  });

  return (
    <ScreenContainer>
      <Text style={styles.greeting}>مرحباً، {user.name} 👋</Text>

      <TouchableOpacity onPress={() => router.push("/(parent)/notifications")} style={styles.notifBar}>
        <Text style={styles.notifBarText}>🔔 الإشعارات</Text>
      </TouchableOpacity>

      {isLoading ? (
        <Text style={styles.muted}>جاري التحميل...</Text>
      ) : !children?.length ? (
        <EmptyState icon="👨‍👩‍👦" title="لا يوجد أبناء مضافون" subtitle="اضغط + لإضافة ابنك" />
      ) : (
        <FlatList
          data={children}
          keyExtractor={(c) => c.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/(parent)/child/${item.id}`)}>
              <Card accentColor={colors.greenMid}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.school}>{(item as any).school?.name ?? ""}</Text>
                  </View>
                  <StatusPill label={STATUS_LABEL[item.status] ?? item.status} tone={STATUS_TONE[item.status] ?? "neutral"} />
                </View>
                {item.busId ? (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/(parent)/tracking/${item.busId}`);
                    }}
                  >
                    <Text style={styles.trackLink}>📍 تتبع الباص مباشرة</Text>
                  </TouchableOpacity>
                ) : null}
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      <Button title="+ إضافة ابن آخر" variant="outline" onPress={() => router.push("/(parent)/add-student")} />
      <Button title="الاشتراك والدفع" variant="outline" onPress={() => router.push("/(parent)/subscription")} />
      <Button title="التواصل والدعم" variant="outline" onPress={() => router.push("/(parent)/contact")} />
      <Button title="حسابي" variant="outline" onPress={() => router.push("/(parent)/profile")} />
      <Button title="تحديث" variant="outline" onPress={() => refetch()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greeting: { fontSize: 18, fontWeight: "800", color: colors.navy, marginBottom: 10 },
  notifBar: { backgroundColor: colors.greenLight, borderRadius: 10, padding: 10, marginBottom: 14 },
  notifBarText: { color: colors.greenMid, fontWeight: "700", textAlign: "center" },
  muted: { color: colors.gray600, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  name: { fontWeight: "700", color: colors.navy, fontSize: 15 },
  school: { color: colors.gray600, fontSize: 12 },
  trackLink: { color: colors.blueMid, fontSize: 12, fontWeight: "700", marginTop: 4 },
});
