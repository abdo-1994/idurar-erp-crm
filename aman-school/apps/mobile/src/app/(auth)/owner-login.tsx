import { EmailPasswordLoginScreen } from "../../features/auth/EmailPasswordLoginScreen";
import { api } from "../../lib/api";

export default function OwnerLoginScreen() {
  return (
    <EmailPasswordLoginScreen
      title="دخول مالك النظام"
      subtitle="أدخل بيانات حساب المالك"
      login={(email, password) => api.auth.ownerLogin(email, password)}
      homeHref="/(owner)/dashboard"
    />
  );
}
