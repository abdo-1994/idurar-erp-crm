import { useState } from "react";
import { Text, TextInput, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, ScreenContainer, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/session";
import { HttpError } from "@aman-school/api-client";

/** P-03: OTP verification. `devOtp` is only ever present outside production
 * (see backend auth.routes.ts) — pre-filled here purely to speed up demoing
 * without a real SMS gateway. */
export default function ParentOtpScreen() {
  const { phone, devOtp } = useLocalSearchParams<{ phone: string; devOtp?: string }>();
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [code, setCode] = useState(devOtp ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.auth.parentVerifyOtp(phone, code);
      await setSession(res);
      router.replace("/(parent)/home");
    } catch (e) {
      setError(e instanceof HttpError ? "رمز خاطئ أو منتهي الصلاحية" : "تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>أرسلنا رمزاً إلى {phone}</Text>
      {devOtp ? <Text style={styles.devNote}>وضع التطوير: تم تعبئة الرمز تلقائياً ({devOtp})</Text> : null}
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="000000"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="تأكيد" onPress={onSubmit} loading={loading} disabled={code.length !== 6} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: "800", color: colors.navy, marginBottom: 8, textAlign: "center" },
  devNote: { fontSize: 11, color: colors.amber, textAlign: "center", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 8,
    backgroundColor: colors.white,
    marginBottom: 14,
  },
  error: { color: colors.red, fontSize: 12, marginBottom: 12, textAlign: "center" },
});
