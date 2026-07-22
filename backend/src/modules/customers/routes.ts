import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { createCustomerSchema, updateCustomerSchema, addNoteSchema } from "./schema";
import * as controller from "./controller";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(controller.listHandler));
router.post(
  "/",
  authorize(Role.ADMIN, Role.SALES),
  validate(createCustomerSchema),
  asyncHandler(controller.createHandler)
);
router.get("/:id", asyncHandler(controller.getByIdHandler));
router.put(
  "/:id",
  authorize(Role.ADMIN, Role.SALES),
  validate(updateCustomerSchema),
  asyncHandler(controller.updateHandler)
);
router.get("/:id/notes", asyncHandler(controller.listNotesHandler));
router.post(
  "/:id/notes",
  authorize(Role.ADMIN, Role.SALES),
  validate(addNoteSchema),
  asyncHandler(controller.addNoteHandler)
);

export default router;
