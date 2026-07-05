import { Text, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Card, ScreenContainer, colors } from "@aman-school/shared-ui";
import { api } from "../../../lib/api";

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: student } = useQuery({ queryKey: ["student", id], queryFn: () => api.school.student(id) });
  const { data: qr } = useQuery({ queryKey: ["student-qr", id], queryFn: () => api.school.studentQrCode(id) });

  return (
    <ScreenContainer>
      <Card>
        <Text style={{ fontSize: 17, fontWeight: "800", color: colors.navy }}>{student?.name}</Text>
        <Text style={{ color: colors.gray600, marginTop: 4 }}>{student?.grade} · {student?.code}</Text>
      </Card>
      {qr?.qrDataUrl ? (
        <Card>
          <Text style={{ textAlign: "center", fontWeight: "700", color: colors.navy, marginBottom: 10 }}>
            كود QR (لولي الأمر لمسحه عند إضافة الطالب)
          </Text>
          <Image source={{ uri: qr.qrDataUrl }} style={{ width: 200, height: 200, alignSelf: "center" }} />
        </Card>
      ) : null}
    </ScreenContainer>
  );
}
