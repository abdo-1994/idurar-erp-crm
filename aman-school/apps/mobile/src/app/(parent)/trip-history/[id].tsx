import { Text, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Card, EmptyState, ScreenContainer, StatusPill, colors } from "@aman-school/shared-ui";
import { api } from "../../../lib/api";

const STATUS_LABEL: Record<string, string> = { scheduled: "مجدولة", active: "جارية", completed: "مكتملة", cancelled: "ملغاة" };
const DIRECTION_LABEL: Record<string, string> = { to_school: "ذهاب", to_home: "عودة" };

export default function TripHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const from = new Date(Date.now() - 30 * 86400000).toISOString();
  const to = new Date().toISOString();
  const { data: trips } = useQuery({
    queryKey: ["student-trips", id],
    queryFn: () => api.parent.studentTrips(id, from, to),
  });

  return (
    <ScreenContainer>
      {!trips?.length ? (
        <EmptyState icon="🗓️" title="لا يوجد رحلات مسجلة" />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(t) => t.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Card>
              <Text style={{ fontWeight: "700", color: colors.navy }}>
                {new Date(item.scheduledAt).toLocaleDateString("ar-SA")} · {DIRECTION_LABEL[item.direction] ?? item.direction}
              </Text>
              <StatusPill label={STATUS_LABEL[item.status] ?? item.status} tone={item.status === "completed" ? "success" : "info"} />
            </Card>
          )}
        />
      )}
    </ScreenContainer>
  );
}
