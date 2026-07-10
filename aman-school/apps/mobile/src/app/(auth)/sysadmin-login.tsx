import { Server } from "lucide-react-native";
import { colors, roleGradients } from "@aman-school/shared-ui";
import { EmailPasswordLoginScreen } from "../../features/auth/EmailPasswordLoginScreen";
import { api } from "../../lib/api";

export default function SysadminLoginScreen() {
  return (
    <EmailPasswordLoginScreen
      title="دخول مدير النظام"
      subtitle="أدخل بيانات حساب مدير النظام"
      login={(email, password) => api.auth.sysadminLogin(email, password)}
      homeHref="/(sysadmin)/dashboard"
      gradient={roleGradients.sysadmin}
      icon={<Server size={40} color={colors.white} />}
    />
  );
}
