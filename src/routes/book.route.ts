import * as express from "express";
import { body } from "express-validator";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  getBooksByAuthorOrTitle,
  getBookWithAuthor,
  updateBook,
} from "../controllers/book.controller.js";

const router = express.Router();

const bookValidationRulesCreate = [
  body("title")
    .isString()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 255 })
    .withMessage("Title must be less than 255 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("published_date")
    .isISO8601()
    .withMessage("Published date must be a valid date (YYYY-MM-DD)"),
  body("author_id")
    .notEmpty()
    .isInt({ gt: 0 })
    .withMessage("Author ID must be a positive number"),
];

const bookValidationRulesForUpdate = [
  body("title")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 255 })
    .withMessage("Title must be less than 255 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("published_date")
    .optional()
    .isISO8601()
    .withMessage("Published date must be a valid date (YYYY-MM-DD)"),
  body("author_id")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Author ID must be a positive number"),
];
router.route("/search/books").get(getBooksByAuthorOrTitle);
router.route("/books").post(bookValidationRulesCreate, verifyJWT, createBook);
router.route("/books").get(getAllBooks);
router.route("/books/:id").get(getBookById);
router
  .route("/books/:id")
  .put(verifyJWT, bookValidationRulesForUpdate, updateBook);
router.route("/books/:id").delete(verifyJWT, deleteBook);
router.route("/books/:id/details").get(getBookWithAuthor);

export default router;
