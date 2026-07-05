import { useState } from "react";
import { Text, TextInput, View, StyleSheet, FlatList } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, ScreenContainer, StatusPill, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/session";

export default function BusesScreen() {
  const schoolId = useSessionStore((s) => s.user?.schoolId)!;
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [busNumber, setBusNumber] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [capacity, setCapacity] = useState("30");

  const { data: buses } = useQuery({ queryKey: ["school-buses", schoolId], queryFn: () => api.school.buses(schoolId) });

  const createMutation = useMutation({
    mutationFn: () => api.school.createBus(schoolId, { busNumber, plateNumber, capacity: Number(capacity) }),
    onSuccess: () => {
      setBusNumber("");
      setPlateNumber("");
      setShowAdd(false);
      queryClient.invalidateQueries({ queryKey: ["school-buses", schoolId] });
    },
  });

  return (
    <ScreenContainer>
      <FlatList
        data={buses}
        keyExtractor={(b) => b.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Card accentColor={colors.amber}>
            <View style={styles.row}>
              <Text style={styles.name}>باص {item.busNumber}</Text>
              <StatusPill label={item.gpsActive ? "GPS نشط" : "غير نشط"} tone={item.gpsActive ? "success" : "neutral"} />
            </View>
            <Text style={styles.meta}>{item.plateNumber} · السعة {item.capacity}</Text>
          </Card>
        )}
      />

      {showAdd ? (
        <View style={{ marginTop: 8 }}>
          <TextInput style={styles.input} value={busNumber} onChangeText={setBusNumber} placeholder="رقم الباص" />
          <TextInput style={styles.input} value={plateNumber} onChangeText={setPlateNumber} placeholder="رقم اللوحة" />
          <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} placeholder="السعة" keyboardType="number-pad" />
          <Button title="حفظ" onPress={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!busNumber || !plateNumber} />
        </View>
      ) : (
        <Button title="+ إضافة باص" onPress={() => setShowAdd(true)} color={colors.amber} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontWeight: "700", color: colors.navy, fontSize: 14 },
  meta: { color: colors.gray600, fontSize: 12, marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 14, backgroundColor: colors.white, marginBottom: 8,
  },
});
