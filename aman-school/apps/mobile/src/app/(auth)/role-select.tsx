import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { colors, roleColors, ScreenContainer } from "@aman-school/shared-ui";
import { ROLE_LABELS_AR, type Role } from "@aman-school/types";

const ROLE_ROUTES: Record<Role, string> = {
  supervisor: "/(auth)/supervisor-login",
  parent: "/(auth)/parent-login",
  school_admin: "/(auth)/school-login",
  ops_room: "/(auth)/ops-login",
  owner: "/(auth)/owner-login",
  sysadmin: "/(auth)/sysadmin-login",
  partner: "/(auth)/partner-login",
};

const ROLE_ICONS: Record<Role, string> = {
  supervisor: "👮",
  parent: "👨‍👩‍👦",
  school_admin: "🏫",
  ops_room: "🎛️",
  owner: "👑",
  sysadmin: "🛠️",
  partner: "🤝",
};

export default function RoleSelectScreen() {
  const router = useRouter();

  return (
    <ScreenContainer backgroundColor={colors.navy}>
      <View style={styles.header}>
        <Text style={styles.logo}>🚌</Text>
        <Text style={styles.title}>أمان سكول</Text>
        <Text style={styles.subtitle}>رحلة أكثر أماناً لأبنائك — اختر صفتك للدخول</Text>
      </View>

      <View style={styles.grid}>
        {(Object.keys(ROLE_ROUTES) as Role[]).map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.card, { borderColor: roleColors[role] }]}
            onPress={() => router.push(ROLE_ROUTES[role] as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.cardIcon}>{ROLE_ICONS[role]}</Text>
            <Text style={styles.cardLabel}>{ROLE_LABELS_AR[role]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginTop: 24, marginBottom: 32, gap: 6 },
  logo: { fontSize: 48 },
  title: { fontSize: 24, fontWeight: "800", color: colors.white },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.75)", textAlign: "center", paddingHorizontal: 24 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" },
  card: {
    width: "44%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 22,
    alignItems: "center",
    gap: 8,
  },
  cardIcon: { fontSize: 32 },
  cardLabel: { color: colors.white, fontWeight: "700", fontSize: 13 },
});
