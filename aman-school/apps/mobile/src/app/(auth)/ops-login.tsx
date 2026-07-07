import { EmailPasswordLoginScreen } from "../../features/auth/EmailPasswordLoginScreen";
import { api } from "../../lib/api";

export default function OpsLoginScreen() {
  return (
    <EmailPasswordLoginScreen
      title="دخول غرفة العمليات"
      subtitle="أدخل بيانات حساب غرفة العمليات"
      login={(email, password) => api.auth.opsRoomLogin(email, password)}
      homeHref="/(operations)/control-room"
    />
  );
}
