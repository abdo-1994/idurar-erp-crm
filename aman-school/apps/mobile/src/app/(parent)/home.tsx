import { Text, View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, EmptyState, ErrorState, LoadingState, ScreenContainer, StatusPill, SubscriptionBanner, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/session";

const STATUS_LABEL: Record<string, string> = { home: "في المنزل", on_the_way: "في الطريق", at_school: "في المدرسة" };
const STATUS_TONE: Record<string, "neutral" | "warning" | "success"> = { home: "neutral", on_the_way: "warning", at_school: "success" };

export default function ParentHomeScreen() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user)!;
  const { data: children, isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: ["parent-children-status", user.id],
    queryFn: () => api.parent.childrenStatus(user.id),
  });
  const { data: subscription } = useQuery({
    queryKey: ["parent-subscription", user.id],
    queryFn: () => api.subscriptions.parentSubscription(user.id),
  });

  return (
    <ScreenContainer refreshing={isRefetching} onRefresh={refetch}>
      <Text style={styles.greeting}>مرحباً، {user.name} 👋</Text>
      <SubscriptionBanner endsAt={subscription?.endsAt} />

      <TouchableOpacity onPress={() => router.push("/(parent)/notifications")} style={styles.notifBar}>
        <Text style={styles.notifBarText}>🔔 الإشعارات</Text>
      </TouchableOpacity>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !children?.length ? (
        <EmptyState icon="👨‍👩‍👦" title="لا يوجد أبناء مضافون" subtitle="اضغط + لإضافة ابنك" />
      ) : (
        <FlatList
          data={children}
          keyExtractor={(c) => c.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Card accentColor={colors.greenMid} onPress={() => router.push(`/(parent)/child/${item.id}`)}>
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
          )}
        />
      )}

      <Button title="+ إضافة ابن آخر" variant="outline" onPress={() => router.push("/(parent)/add-student")} />
      <Button title="الاشتراك والدفع" variant="outline" onPress={() => router.push("/(parent)/subscription")} />
      <Button title="🧾 الفواتير" variant="outline" onPress={() => router.push("/(parent)/invoices")} />
      <Button title="💳 حالة وسائل الدفع" variant="outline" onPress={() => router.push("/(parent)/payment-status")} />
      <Button title="التواصل والدعم" variant="outline" onPress={() => router.push("/(parent)/contact")} />
      <Button title="حسابي" variant="outline" onPress={() => router.push("/(parent)/profile")} />
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
