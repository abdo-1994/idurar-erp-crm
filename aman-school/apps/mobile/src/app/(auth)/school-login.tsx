import { EmailPasswordLoginScreen } from "../../features/auth/EmailPasswordLoginScreen";
import { api } from "../../lib/api";

export default function SchoolLoginScreen() {
  return (
    <EmailPasswordLoginScreen
      title="دخول مدير المدرسة"
      subtitle="أدخل بيانات حساب المدرسة"
      login={(email, password) => api.auth.schoolAdminLogin(email, password)}
      homeHref="/(school)/dashboard"
    />
  );
}
