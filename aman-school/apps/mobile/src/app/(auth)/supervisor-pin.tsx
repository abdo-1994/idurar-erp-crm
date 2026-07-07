import { useState } from "react";
import { Text, TextInput, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, ScreenContainer, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/session";
import { HttpError } from "@aman-school/api-client";

/** S-01 step 2: local PIN pad. */
export default function SupervisorPinScreen() {
  const { employeeCode } = useLocalSearchParams<{ employeeCode: string }>();
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.auth.supervisorPinVerify(employeeCode, pin);
      await setSession(res);
      router.replace("/(supervisor)/trip-select");
    } catch (e) {
      setError(e instanceof HttpError ? "PIN خاطئ" : "تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>أدخل رمز PIN</Text>
      <Text style={styles.subtitle}>الموظف: {employeeCode}</Text>
      <TextInput
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        placeholder="••••"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="دخول" onPress={onSubmit} loading={loading} disabled={pin.length < 4} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "800", color: colors.navy, marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 13, color: colors.gray600, marginBottom: 16, textAlign: "center" },
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
