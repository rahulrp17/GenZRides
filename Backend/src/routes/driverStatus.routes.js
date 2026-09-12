import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

import {
  toggleOnlineStatus,
  getDriverPerformance,
} from "../controllers/driverStatus.controller.js";

const router = express.Router();

/* ===========================================================
   DRIVER AUTH
=========================================================== */

router.use(authenticate);
router.use(authorize("driver"));

/* ===========================================================
   ONLINE / OFFLINE
=========================================================== */

router.put("/online", toggleOnlineStatus);

/* ===========================================================
   DRIVER PERFORMANCE
=========================================================== */

router.get("/performance", getDriverPerformance);

export default router;