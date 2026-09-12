import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validateQuery } from "../middleware/validate.middleware.js";
import { paginationQuerySchema } from "../validators/common.validator.js";
import { getRideHistory } from "../controllers/history.controller.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("customer"),
  validateQuery(paginationQuerySchema),
  getRideHistory
);

export default router;
