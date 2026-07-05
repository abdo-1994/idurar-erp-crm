import express from "express";
import cors from "cors";
import { createServer } from "http";
import { env } from "./env";
import { errorHandler } from "./lib/errors";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./routes/auth.routes";
import { studentsRouter } from "./routes/students.routes";
import { tripsRouter } from "./routes/trips.routes";
import { supervisorRouter } from "./routes/supervisor.routes";
import { busesRouter } from "./routes/buses.routes";
import { emergencyRouter } from "./routes/emergency.routes";
import { parentsRouter } from "./routes/parents.routes";
import { notificationsRouter } from "./routes/notifications.routes";
import { schoolsRouter } from "./routes/schools.routes";
import { operationsRouter } from "./routes/operations.routes";
import { ownerRouter } from "./routes/owner.routes";
import { partnerRouter } from "./routes/partner.routes";
import { initSocketGateway } from "./sockets/gateway";
import { startGpsSimulator } from "./sockets/simulator";

const app = express();
app.use(cors({ origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(","), credentials: true }));
app.use(express.json());

app.use(healthRouter);
app.use(authRouter);
app.use(studentsRouter);
app.use(tripsRouter);
app.use(supervisorRouter);
app.use(busesRouter);
app.use(emergencyRouter);
app.use(parentsRouter);
app.use(notificationsRouter);
app.use(schoolsRouter);
app.use(operationsRouter);
app.use(ownerRouter);
app.use(partnerRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);

const httpServer = createServer(app);
initSocketGateway(httpServer);
startGpsSimulator();

httpServer.listen(env.port, () => {
  console.log(`Aman School backend listening on :${env.port} (${env.nodeEnv})`);
});
