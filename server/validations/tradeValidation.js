import { body } from "express-validator";

/* ==========================================================
   Buy/Sell Validation
========================================================== */

export const tradeValidation = [
  body("asset")
    .notEmpty()
    .withMessage("Asset ID is required")
    .isMongoId()
    .withMessage("Invalid Asset ID"),

  body("tradeType")
    .notEmpty()
    .withMessage("Trade type is required")
    .isIn(["BUY", "SELL"])
    .withMessage("Trade type must be BUY or SELL"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isFloat({ gt: 0 })
    .withMessage("Quantity must be greater than 0"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than 0"),
];