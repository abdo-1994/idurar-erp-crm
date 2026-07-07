import { EmailPasswordLoginScreen } from "../../features/auth/EmailPasswordLoginScreen";
import { api } from "../../lib/api";

export default function SysadminLoginScreen() {
  return (
    <EmailPasswordLoginScreen
      title="دخول مدير النظام"
      subtitle="أدخل بيانات حساب مدير النظام"
      login={(email, password) => api.auth.sysadminLogin(email, password)}
      homeHref="/(sysadmin)/dashboard"
    />
  );
}
