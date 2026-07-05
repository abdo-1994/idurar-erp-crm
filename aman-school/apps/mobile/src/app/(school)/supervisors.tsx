import { useState } from "react";
import { Text, TextInput, View, StyleSheet, FlatList, Alert } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, ScreenContainer, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/session";

export default function SupervisorsScreen() {
  const schoolId = useSessionStore((s) => s.user?.schoolId)!;
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { data: supervisors } = useQuery({
    queryKey: ["school-supervisors", schoolId],
    queryFn: () => api.school.supervisors(schoolId),
  });

  const createMutation = useMutation({
    mutationFn: () => api.school.createSupervisor(schoolId, { name, phone }),
    onSuccess: (res: any) => {
      setName("");
      setPhone("");
      setShowAdd(false);
      queryClient.invalidateQueries({ queryKey: ["school-supervisors", schoolId] });
      if (res.devEmployeeCode) {
        Alert.alert("تم الإنشاء", `رمز الموظف: ${res.devEmployeeCode}\nPIN: ${res.devPin}`);
      }
    },
  });

  return (
    <ScreenContainer>
      <FlatList
        data={supervisors}
        keyExtractor={(s) => s.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Card accentColor={colors.blueMid}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.employeeCode} · {item.phone}</Text>
          </Card>
        )}
      />

      {showAdd ? (
        <View style={{ marginTop: 8 }}>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="اسم المشرف" />
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="رقم الجوال" keyboardType="phone-pad" />
          <Button title="حفظ" onPress={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!name || !phone} />
        </View>
      ) : (
        <Button title="+ إضافة مشرف" onPress={() => setShowAdd(true)} color={colors.amber} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  name: { fontWeight: "700", color: colors.navy, fontSize: 14 },
  meta: { color: colors.gray600, fontSize: 12, marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 14, backgroundColor: colors.white, marginBottom: 8,
  },
});
