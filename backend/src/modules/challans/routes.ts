import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { createChallanSchema, updateChallanSchema } from "./schema";
import * as controller from "./controller";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(controller.listHandler));
router.post(
  "/",
  authorize(Role.ADMIN, Role.SALES),
  validate(createChallanSchema),
  asyncHandler(controller.createHandler)
);
router.get("/:id", asyncHandler(controller.getByIdHandler));
router.put(
  "/:id",
  authorize(Role.ADMIN, Role.SALES),
  validate(updateChallanSchema),
  asyncHandler(controller.updateHandler)
);
router.post("/:id/confirm", authorize(Role.ADMIN, Role.SALES), asyncHandler(controller.confirmHandler));
router.post("/:id/cancel", authorize(Role.ADMIN, Role.SALES), asyncHandler(controller.cancelHandler));

export default router;
