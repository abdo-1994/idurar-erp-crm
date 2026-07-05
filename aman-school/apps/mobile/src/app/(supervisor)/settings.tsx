import { Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, ScreenContainer, ComingSoonScreen, colors } from "@aman-school/shared-ui";
import { useLogout } from "../../features/shared/RoleGuardLayout";

/** S-14 is "قيد التصميم" in the spec — full settings UI (sound/vibration/NFC
 * prefs, PIN change, manual sync) is stubbed, but logout is wired up here
 * since every role module needs a working way to sign out during testing. */
export default function SupervisorSettingsScreen() {
  const router = useRouter();
  const logout = useLogout();

  return (
    <ScreenContainer>
      <ComingSoonScreen screenId="S-14" title="الإعدادات" />
      <Text style={{ height: 16 }} />
      <Button
        title="تسجيل الخروج"
        color={colors.red}
        onPress={async () => {
          await logout();
          router.replace("/(auth)/role-select");
        }}
      />
    </ScreenContainer>
  );
}
