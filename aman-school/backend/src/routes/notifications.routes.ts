import { Router } from "express";
import { prisma } from "../prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { authenticate } from "../auth/middleware";
import { forbidden, notFound } from "../lib/errors";

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);

notificationsRouter.put(
  "/notifications/:id/read",
  asyncHandler(async (req, res) => {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notification) throw notFound("Notification");
    if (notification.userId !== req.user!.sub) throw forbidden();
    const updated = await prisma.notification.update({ where: { id: notification.id }, data: { read: true } });
    res.json(updated);
  })
);
