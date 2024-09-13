import * as express from "express";
import { body } from "express-validator";
import { logoutUser, registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/user.controller.js";

const router = express.Router();

const userValidationRulesForRegister = [
  body("username").isString().notEmpty().withMessage("Username is required"),
  body("fullname").isString().notEmpty().withMessage("Name is required"),
  body("email").notEmpty().isEmail().withMessage("Invalid email format"),
  body("password")
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const userValidationRulesForLogin = [
  body("email").isEmail().withMessage("Invalid email format"),
];

router.route("/register").post(userValidationRulesForRegister, registerUser);
router.route("/login").post(userValidationRulesForLogin, loginUser);
router.route("/logout").get(logoutUser);

export default router;
