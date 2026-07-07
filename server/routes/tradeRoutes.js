import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { tradeValidation } from "../validations/tradeValidation.js";

import {
  buy,
  sell,
  history,
  details,
  remove,
} from "../controllers/tradeController.js";

const router = express.Router();

/* ==========================================================
   Buy Asset
========================================================== */

router.post(
  "/buy",
  protect,
  tradeValidation,
  validateRequest,
  buy
);

/* ==========================================================
   Sell Asset
========================================================== */

router.post(
  "/sell",
  protect,
  tradeValidation,
  validateRequest,
  sell
);

/* ==========================================================
   Trade History
========================================================== */

router.get(
  "/history",
  protect,
  history
);

/* ==========================================================
   Trade Details
========================================================== */

router.get(
  "/:id",
  protect,
  details
);

/* ==========================================================
   Delete Trade
========================================================== */

router.delete(
  "/:id",
  protect,
  remove
);

export default router;