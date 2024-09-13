import * as express from "express";
import { body } from "express-validator";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorsWithBooks,
  getAuthorWithBooks,
} from "../controllers/author.controller.js";

const router = express.Router();

const authorValidationRulesForCreate = [
  body("name")
    .isString()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 255 })
    .withMessage("Name must be less than 255 characters"),

  body("bio").optional().isString().withMessage("Bio must be a string"),

  body("birthdate")
    .isISO8601()
    .toDate()
    .withMessage("Birthdate must be a valid date (YYYY-MM-DD)"),
];

const authorValidationRulesForUpdate = [
  body("name")
    .isString()
    .optional()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 255 })
    .withMessage("Name must be less than 255 characters"),

  body("bio").optional().isString().withMessage("Bio must be a string"),

  body("birthdate")
    .isISO8601()
    .optional()
    .toDate()
    .withMessage("Birthdate must be a valid date (YYYY-MM-DD)"),
];

router.route("/authors/with-books").get(getAuthorsWithBooks);
router.route("/authors").get(getAllAuthors);
router
  .route("/authors")
  .post(verifyJWT, authorValidationRulesForCreate, createAuthor);
router.route("/authors/:id").get(getAuthorById);
router
  .route("/authors/:id")
  .put(verifyJWT, authorValidationRulesForUpdate, updateAuthor);
router.route("/authors/:id").delete(verifyJWT, deleteAuthor);
router.route("/authors/:id/details").get(getAuthorWithBooks);

export default router;
