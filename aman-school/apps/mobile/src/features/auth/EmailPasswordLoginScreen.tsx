import { useState } from "react";
import { Text, TextInput, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Button, ScreenContainer, colors } from "@aman-school/shared-ui";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/session";
import { HttpError } from "@aman-school/api-client";

type LoginFn = (email: string, password: string) => ReturnType<typeof api.auth.schoolAdminLogin>;

export function EmailPasswordLoginScreen({
  title,
  subtitle,
  login,
  homeHref,
}: {
  title: string;
  subtitle: string;
  login: LoginFn;
  homeHref: string;
}) {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      await setSession(res);
      router.replace(homeHref as never);
    } catch (e) {
      setError(e instanceof HttpError ? String((e.body as { error?: string })?.error ?? "بيانات خاطئة") : "تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.field}>
        <Text style={styles.label}>البريد الإلكتروني</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="admin@school.sa"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>كلمة المرور</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="دخول" onPress={onSubmit} loading={loading} disabled={!email || !password} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800", color: colors.navy, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.gray600, marginBottom: 20 },
  field: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "700", color: colors.gray700, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: colors.white,
  },
  error: { color: colors.red, fontSize: 12, marginBottom: 12, textAlign: "center" },
});
