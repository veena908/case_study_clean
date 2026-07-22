import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { loginSchema } from "./schema";
import { loginHandler, meHandler } from "./controller";

const router = Router();

router.post("/login", validate(loginSchema), asyncHandler(loginHandler));
router.get("/me", authenticate, asyncHandler(meHandler));

export default router;
