import {
  Alert,
  AuthResponse,
  Bus,
  Notification,
  School,
  Student,
  Trip,
  TripEvent,
  User,
} from "@aman-school/types";
import { ApiClientConfig, createHttp } from "./http";
export { createSocket } from "./socket";
export * from "./http";

export function createApiClient(config: ApiClientConfig) {
  const http = createHttp(config);

  return {
    auth: {
      supervisorLogin: (employeeCode: string) =>
        http.post<{ ok: true }>("/auth/supervisor/login", { employeeCode }),
      supervisorPinVerify: (employeeCode: string, pin: string) =>
        http.post<AuthResponse>("/auth/supervisor/pin-verify", { employeeCode, pin }),
      parentRequestOtp: (phone: string) =>
        http.post<{ ok: true }>("/auth/parent/request-otp", { phone }),
      parentVerifyOtp: (phone: string, code: string) =>
        http.post<AuthResponse>("/auth/parent/verify-otp", { phone, code }),
      schoolAdminLogin: (email: string, password: string, otp?: string) =>
        http.post<AuthResponse>("/auth/school-admin/login", { email, password, otp }),
      opsRoomLogin: (email: string, password: string) =>
        http.post<AuthResponse>("/auth/ops-room/login", { email, password }),
      ownerLogin: (email: string, password: string) =>
        http.post<AuthResponse>("/auth/owner/login", { email, password }),
    },

    supervisor: {
      todayTrips: () => http.get<Trip[]>("/supervisor/trips/today"),
      assignSupervisor: (tripId: string) => http.post(`/trips/${tripId}/assign-supervisor`),
      tripStudents: (tripId: string) => http.get<Student[]>(`/trips/${tripId}/students`),
      startTrip: (tripId: string) => http.post<Trip>(`/trips/${tripId}/start`),
      setBusGpsActive: (busId: string, active: boolean) =>
        http.put(`/buses/${busId}/gps-active`, { active }),
      board: (tripId: string, studentId: string, method: "nfc" | "manual" = "nfc") =>
        http.post<TripEvent>(`/trips/${tripId}/board`, { studentId, method }),
      alight: (tripId: string, studentId: string) =>
        http.post<TripEvent>(`/trips/${tripId}/alight`, { studentId }),
      searchStudents: (query: string) =>
        http.get<Student[]>(`/students/search?q=${encodeURIComponent(query)}`),
      manualBoard: (tripId: string, studentId: string, reason: string) =>
        http.post<TripEvent>(`/trips/${tripId}/manual-board`, { studentId, reason }),
      liveStatus: (tripId: string) => http.get<Trip & { events: TripEvent[] }>(`/trips/${tripId}/live-status`),
      recordException: (tripId: string, body: { type: string; description: string; photoUrl?: string }) =>
        http.post(`/trips/${tripId}/exception`, body),
      endTrip: (tripId: string) => http.put<Trip>(`/trips/${tripId}/end`),
      tripReport: (tripId: string) => http.get(`/trips/${tripId}/report`),
      sos: (body: { tripId: string | null; lat: number; lng: number; description?: string }) =>
        http.post("/emergency/sos", body),
      notifications: (supervisorId: string) =>
        http.get<Notification[]>(`/supervisor/${supervisorId}/notifications`),
      updateSettings: (supervisorId: string, body: Record<string, unknown>) =>
        http.put(`/supervisor/${supervisorId}/settings`, body),
    },

    parent: {
      linkStudent: (studentCode: string) =>
        http.post<Student>("/parents/students/link", { studentCode }),
      childrenStatus: (parentId: string) =>
        http.get<Array<Student & { status: string; lastUpdate: string }>>(
          `/parents/${parentId}/children/status`
        ),
      studentTodayStatus: (studentId: string) => http.get(`/students/${studentId}/today-status`),
      studentDetails: (studentId: string) => http.get<Student>(`/students/${studentId}/details`),
      busEta: (busId: string) => http.get<{ etaMinutes: number; distanceKm: number; stopsBefore: number }>(
        `/buses/${busId}/eta`
      ),
      studentTrips: (studentId: string, from: string, to: string) =>
        http.get<Trip[]>(`/students/${studentId}/trips?from=${from}&to=${to}`),
      notifications: (parentId: string) => http.get<Notification[]>(`/parents/${parentId}/notifications`),
      markNotificationRead: (id: string) => http.put(`/notifications/${id}/read`),
      updateNotificationPrefs: (parentId: string, body: Record<string, unknown>) =>
        http.put(`/parents/${parentId}/notification-prefs`, body),
      contactSupport: (body: { message: string; channel: string }) =>
        http.post("/support/contact", body),
    },

    school: {
      dashboardSummary: (schoolId: string) => http.get(`/schools/${schoolId}/dashboard-summary`),
      students: (schoolId: string, query = "") => http.get<Student[]>(`/schools/${schoolId}/students${query}`),
      createStudent: (schoolId: string, body: Partial<Student>) =>
        http.post<Student>(`/schools/${schoolId}/students`, body),
      updateStudent: (studentId: string, body: Partial<Student>) =>
        http.put<Student>(`/students/${studentId}`, body),
      studentQrCode: (studentId: string) => http.get<{ qrDataUrl: string }>(`/students/${studentId}/qr-code`),
      student: (studentId: string) => http.get<Student>(`/students/${studentId}`),
      buses: (schoolId: string) => http.get<Bus[]>(`/schools/${schoolId}/buses`),
      createBus: (schoolId: string, body: Partial<Bus>) => http.post<Bus>(`/schools/${schoolId}/buses`, body),
      setBusGpsDevice: (busId: string, gpsDeviceId: string) =>
        http.put(`/buses/${busId}/gps-device`, { gpsDeviceId }),
      supervisors: (schoolId: string) => http.get<User[]>(`/schools/${schoolId}/supervisors`),
      createSupervisor: (schoolId: string, body: { name: string; phone: string }) =>
        http.post<User>(`/schools/${schoolId}/supervisors`, body),
      createRoute: (busId: string, body: { stops: Array<{ name: string; lat: number; lng: number }> }) =>
        http.post(`/buses/${busId}/route`, body),
      setStudentStop: (studentId: string, stopId: string) =>
        http.put(`/students/${studentId}/stop`, { stopId }),
      reports: (schoolId: string, query = "") => http.get(`/schools/${schoolId}/reports${query}`),
      broadcastNotification: (schoolId: string, body: { title: string; body: string }) =>
        http.post(`/schools/${schoolId}/notifications/broadcast`, body),
      updateSettings: (schoolId: string, body: Partial<School>) =>
        http.put(`/schools/${schoolId}/settings`, body),
    },

    operations: {
      activeTrips: () => http.get<Trip[]>("/operations/active-trips"),
      alerts: (status: string = "active") => http.get<Alert[]>(`/alerts?status=${status}`),
      acknowledgeAlert: (id: string, assignedToUserId?: string) =>
        http.put<Alert>(`/alerts/${id}/acknowledge`, { assignedToUserId }),
      resolveAlert: (id: string, reason: string) => http.put<Alert>(`/alerts/${id}/resolve`, { reason }),
      incident: (id: string) => http.get(`/incidents/${id}`),
      incidentAction: (id: string, body: { note: string }) => http.post(`/incidents/${id}/actions`, body),
      notifyParents: (id: string, body: { message: string }) =>
        http.post(`/incidents/${id}/notify-parents`, body),
      sendMessage: (body: { toUserId: string; message: string; channel: "app" | "sms" }) =>
        http.post("/operations/messages", body),
      dailyReport: () => http.get("/operations/daily-report"),
    },

    owner: {
      platformSummary: () => http.get("/owner/platform-summary"),
      schools: (query = "") => http.get<School[]>(`/owner/schools${query}`),
      registerSchool: (body: {
        name: string; slug: string; address?: string; adminName: string; adminEmail: string;
        packageId: string; partnerId?: string;
      }) => http.post<School>("/owner/schools/register", body),
      setSchoolStatus: (schoolId: string, status: string) =>
        http.put(`/schools/${schoolId}/status`, { status }),
      schoolDetail: (schoolId: string) => http.get(`/owner/schools/${schoolId}/detail`),
      partners: () => http.get(`/owner/partners`),
      registerPartner: (body: { name: string; region: string; commissionPercent: number }) =>
        http.post("/owner/partners/register", body),
      updatePartner: (id: string, body: Record<string, unknown>) => http.put(`/owner/partners/${id}`, body),
      packages: () => http.get(`/owner/packages`),
      updatePackage: (id: string, body: Record<string, unknown>) => http.put(`/owner/packages/${id}`, body),
      subscriptions: () => http.get(`/owner/subscriptions`),
      revenueSummary: () => http.get(`/owner/revenue/summary`),
      invoices: () => http.get(`/owner/invoices`),
      analytics: () => http.get(`/owner/analytics`),
      platformSettings: () => http.get(`/owner/platform-settings`),
      updatePlatformSettings: (body: Record<string, unknown>) => http.put(`/owner/platform-settings`, body),
    },

    partner: {
      dashboard: (partnerId: string) => http.get(`/partners/${partnerId}/dashboard`),
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
