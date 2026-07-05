import { EmailPasswordLoginScreen } from "../../features/auth/EmailPasswordLoginScreen";
import { api } from "../../lib/api";

export default function PartnerLoginScreen() {
  return (
    <EmailPasswordLoginScreen
      title="دخول الشريك"
      subtitle="أدخل بيانات حساب الشريك"
      login={(email, password) => api.auth.partnerLogin(email, password)}
      homeHref="/(owner)/partner-dashboard"
    />
  );
}
