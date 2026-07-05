import { useState } from "react";
import { Text, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Button, ScreenContainer, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";

/** P-02: phone-only login, no password — requests an OTP then routes to P-03. */
export default function ParentLoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("+9665");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.auth.parentRequestOtp(phone.trim());
      router.push({
        pathname: "/(auth)/parent-otp",
        params: { phone: phone.trim(), devOtp: (res as { devOtp?: string }).devOtp ?? "" },
      });
    } catch {
      setError("تعذر إرسال الرمز — تحقق من رقم الجوال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>أدخل رقم جوالك</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="+966501111111"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="متابعة" onPress={onSubmit} loading={loading} disabled={phone.length < 8} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "800", color: colors.navy, marginBottom: 16, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    textAlign: "center",
    backgroundColor: colors.white,
    marginBottom: 14,
  },
  error: { color: colors.red, fontSize: 12, marginBottom: 12, textAlign: "center" },
});
