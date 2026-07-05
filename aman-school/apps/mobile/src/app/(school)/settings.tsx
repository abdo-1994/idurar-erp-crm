import { Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, ScreenContainer, ComingSoonScreen, colors } from "@aman-school/shared-ui";
import { useLogout } from "../../features/shared/RoleGuardLayout";

export default function SchoolSettingsScreen() {
  const router = useRouter();
  const logout = useLogout();

  return (
    <ScreenContainer>
      <ComingSoonScreen screenId="SCH-11" title="إعدادات المدرسة" />
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
