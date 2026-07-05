import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import type {
  Alert,
  ClientToServerEvents,
  GpsPing,
  ServerToClientEvents,
  Trip,
  TripEvent,
} from "@aman-school/types";
import { env } from "../env";
import { verifyAccessToken } from "../auth/jwt";

type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

let io: AppServer | null = null;

export function initSocketGateway(httpServer: HttpServer): AppServer {
  io = new Server(httpServer, {
    cors: { origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(","), credentials: true },
  });

  // Auth handshake: client passes { auth: { token } } per packages/api-client/src/socket.ts
  io.use((socket, next) => {
    const token = (socket.handshake.auth as { token?: string } | undefined)?.token;
    if (!token) return next(new Error("unauthorized: missing token"));
    try {
      const claims = verifyAccessToken(token);
      socket.data.user = claims;
      next();
    } catch {
      next(new Error("unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket: AppSocket) => {
    socket.on("subscribe:bus", (busId: string) => socket.join(`bus:${busId}`));
    socket.on("unsubscribe:bus", (busId: string) => socket.leave(`bus:${busId}`));
    socket.on("subscribe:school", (schoolId: string) => socket.join(`school:${schoolId}`));
    socket.on("subscribe:operations", (_scopeId: string) => socket.join("operations"));
  });

  return io;
}

function getIo(): AppServer {
  if (!io) throw new Error("Socket.IO gateway not initialized — call initSocketGateway first");
  return io;
}

export function emitBusLocation(ping: GpsPing, schoolId: string) {
  const server = getIo();
  server.to(`bus:${ping.busId}`).emit("bus:location", ping);
  server.to(`school:${schoolId}`).emit("bus:location", ping);
  server.to("operations").emit("bus:location", ping);
}

export function emitTripUpdated(trip: Trip) {
  const server = getIo();
  server.to(`bus:${trip.busId}`).emit("trip:updated", trip);
  server.to(`school:${trip.schoolId}`).emit("trip:updated", trip);
  server.to("operations").emit("trip:updated", trip);
}

export function emitTripEvent(event: TripEvent, busId: string, schoolId: string) {
  const server = getIo();
  server.to(`bus:${busId}`).emit("trip:event", event);
  server.to(`school:${schoolId}`).emit("trip:event", event);
  server.to("operations").emit("trip:event", event);
}

export function emitAlertNew(alert: Alert) {
  const server = getIo();
  server.to(`school:${alert.schoolId}`).emit("alert:new", alert);
  server.to("operations").emit("alert:new", alert);
}

export function emitAlertUpdated(alert: Alert) {
  const server = getIo();
  server.to(`school:${alert.schoolId}`).emit("alert:updated", alert);
  server.to("operations").emit("alert:updated", alert);
}
