import { useState } from "react";
import { Text, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Button, ScreenContainer, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";
import { HttpError } from "@aman-school/api-client";

/* ---- D-01 step 1: driver employee code lookup, then routes to the PIN pad ---- */
export default function DriverLoginScreen() {
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await api.auth.driverLogin(employeeCode.trim());
      router.push({ pathname: "/(auth)/driver-pin", params: { employeeCode: employeeCode.trim() } });
    } catch (e) {
      setError(e instanceof HttpError ? "رمز موظف غير صحيح" : "تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>أدخل رمز الموظف (السائق)</Text>
      <TextInput
        style={styles.input}
        value={employeeCode}
        onChangeText={setEmployeeCode}
        autoCapitalize="characters"
        placeholder="DRV-1001"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="متابعة" onPress={onSubmit} loading={loading} disabled={!employeeCode} />
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
    fontSize: 18,
    textAlign: "center",
    backgroundColor: colors.white,
    marginBottom: 14,
  },
  error: { color: colors.red, fontSize: 12, marginBottom: 12, textAlign: "center" },
});
