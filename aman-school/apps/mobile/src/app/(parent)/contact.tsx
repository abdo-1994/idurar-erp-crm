import { useState } from "react";
import { Text, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Button, ScreenContainer, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";

export default function ContactScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const mutation = useMutation({
    mutationFn: () => api.parent.contactSupport({ message, channel: "app" }),
    onSuccess: () => {
      Alert.alert("تم الإرسال", "سيتواصل معك فريق الدعم قريباً");
      router.back();
    },
  });

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 13, color: colors.gray600, marginBottom: 12, textAlign: "center" }}>
        للطوارئ الفورية استخدم زر SOS في صفحة تفاصيل الابن
      </Text>
      <TextInput
        style={{
          borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 12, minHeight: 100,
          textAlignVertical: "top", backgroundColor: colors.white, marginBottom: 14,
        }}
        value={message}
        onChangeText={setMessage}
        placeholder="اكتب رسالتك إلى المدرسة / الدعم"
        multiline
      />
      <Button title="إرسال" onPress={() => mutation.mutate()} loading={mutation.isPending} disabled={!message} />
    </ScreenContainer>
  );
}
