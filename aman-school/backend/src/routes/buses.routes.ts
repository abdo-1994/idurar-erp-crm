import { Router } from "express";
import { prisma } from "../prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { authenticate, assertSchoolAccess, requireRole } from "../auth/middleware";
import { badRequest, notFound } from "../lib/errors";
import { distanceKm } from "../lib/geo";

export const busesRouter = Router();
busesRouter.use(authenticate);

/* ---- S-04: toggle GPS active flag on trip start/end ---- */
busesRouter.put(
  "/buses/:id/gps-active",
  requireRole("supervisor"),
  asyncHandler(async (req, res) => {
    const bus = await prisma.bus.findUnique({ where: { id: req.params.id } });
    if (!bus) throw notFound("Bus");
    assertSchoolAccess(req.user!, bus.schoolId);
    const { active } = req.body ?? {};
    const updated = await prisma.bus.update({ where: { id: bus.id }, data: { gpsActive: Boolean(active) } });
    res.json(updated);
  })
);

/* ---- SCH-05: link a physical GPS device to a bus ---- */
busesRouter.put(
  "/buses/:id/gps-device",
  requireRole("school_admin", "owner", "partner"),
  asyncHandler(async (req, res) => {
    const bus = await prisma.bus.findUnique({ where: { id: req.params.id } });
    if (!bus) throw notFound("Bus");
    assertSchoolAccess(req.user!, bus.schoolId);
    const { gpsDeviceId } = req.body ?? {};
    if (!gpsDeviceId) throw badRequest("gpsDeviceId is required");
    const updated = await prisma.bus.update({ where: { id: bus.id }, data: { gpsDeviceId } });
    res.json(updated);
  })
);

/* ---- SCH-07: define a bus's route + stops ---- */
busesRouter.post(
  "/buses/:id/route",
  requireRole("school_admin", "owner", "partner"),
  asyncHandler(async (req, res) => {
    const bus = await prisma.bus.findUnique({ where: { id: req.params.id } });
    if (!bus) throw notFound("Bus");
    assertSchoolAccess(req.user!, bus.schoolId);
    const { stops } = req.body ?? {};
    if (!Array.isArray(stops) || stops.length === 0) throw badRequest("stops[] is required");

    const route = await prisma.route.upsert({
      where: { busId: bus.id },
      update: {},
      create: { schoolId: bus.schoolId, busId: bus.id },
    });
    await prisma.stop.deleteMany({ where: { routeId: route.id } });
    await prisma.stop.createMany({
      data: stops.map((s: { name: string; lat: number; lng: number }, i: number) => ({
        routeId: route.id,
        order: i,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
      })),
    });
    const full = await prisma.route.findUnique({ where: { id: route.id }, include: { stops: true } });
    res.status(201).json(full);
  })
);

/* ---- P-07: ETA — distance/speed estimate from the bus's current GPS fix to its next stop ---- */
busesRouter.get(
  "/buses/:id/eta",
  asyncHandler(async (req, res) => {
    const bus = await prisma.bus.findUnique({
      where: { id: req.params.id },
      include: { route: { include: { stops: true } } },
    });
    if (!bus) throw notFound("Bus");
    assertSchoolAccess(req.user!, bus.schoolId);

    const stops = bus.route?.stops.slice().sort((a, b) => a.order - b.order) ?? [];
    if (!bus.gpsActive || bus.currentLat == null || bus.currentLng == null || stops.length === 0) {
      return res.json({ etaMinutes: null, distanceKm: null, stopsBefore: null, status: "الرحلة لم تبدأ بعد" });
    }

    const activeTrip = await prisma.trip.findFirst({ where: { busId: bus.id, status: "active" } });
    const fromIdx = Math.min(activeTrip?.simStopIndex ?? 0, stops.length - 1);
    const remainingStops = stops.slice(fromIdx + 1);
    const lastStop = stops[stops.length - 1];

    const dist = distanceKm(bus.currentLat, bus.currentLng, lastStop.lat, lastStop.lng);
    const assumedSpeedKmh = bus.currentSpeedKmh && bus.currentSpeedKmh > 5 ? bus.currentSpeedKmh : 25;
    const etaMinutes = Math.max(1, Math.round((dist / assumedSpeedKmh) * 60));

    res.json({ etaMinutes, distanceKm: Math.round(dist * 10) / 10, stopsBefore: remainingStops.length });
  })
);
