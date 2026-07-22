import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { createProductSchema, updateProductSchema, stockMovementSchema } from "./schema";
import * as controller from "./controller";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(controller.listHandler));
router.post(
  "/",
  authorize(Role.ADMIN, Role.WAREHOUSE),
  validate(createProductSchema),
  asyncHandler(controller.createHandler)
);
router.get("/:id", asyncHandler(controller.getByIdHandler));
router.put(
  "/:id",
  authorize(Role.ADMIN, Role.WAREHOUSE),
  validate(updateProductSchema),
  asyncHandler(controller.updateHandler)
);
router.get("/:id/movements", asyncHandler(controller.listMovementsHandler));
router.post(
  "/:id/stock",
  authorize(Role.ADMIN, Role.WAREHOUSE),
  validate(stockMovementSchema),
  asyncHandler(controller.stockMovementHandler)
);

export default router;
