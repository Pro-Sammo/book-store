import { Request, Response } from "express";
import db from "../database.js";
import { Book } from "../types/book.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Error.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validationResult } from "express-validator";
import { Author } from "../types/author.js";

interface CompleteDataType {
  total: string;
  page: number;
  limit: number;
  books: Record<string, any>;
}

const getAllBooks = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, author_id } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const authorId = Number(author_id);
  const offset = (pageNumber - 1) * limitNumber;

  let books;
  if (author_id) {
    books = await db<Book>("books")
      .where({ author_id: authorId })
      .select("*")
      .offset(offset)
      .limit(limitNumber);
  } else {
    books = await db<Book>("books")
      .select("*")
      .offset(offset)
      .limit(limitNumber);
  }

  const totalBooks: any = await db<Book>("books").count("* as count").first();

  const completeDate: CompleteDataType = {
    total: totalBooks?.count,
    page: pageNumber,
    limit: limitNumber,
    books: books,
  };

  res
    .status(200)
    .json(new ApiResponse(200, completeDate, "Data fetched successfully"));
});

const createBook = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, published_date, author_id } = req.body;

  const author = await db<Author>("authors").where({ id: author_id }).first();

  if (!author) throw new ApiError(404, "Invalid Author id");

  const [newBookId] = await db<Book>("books").insert({
    title,
    description,
    published_date,
    author_id,
  });

  const newBook = await db<Book>("books").where({ id: newBookId }).first();

  if (!newBook) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  res
    .status(201)
    .json(new ApiResponse(201, { newBook }, "New Book Created Successfully"));
});

const getBookById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const bookId = Number(id);

  const book = await db<Book>("books").where({ id: bookId }).first();

  if (!book) throw new ApiError(404, "Book not found");

  res.status(200).json(new ApiResponse(200, book, "Data fetched successfully"));
});

const updateBook = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const bookId = Number(id);
  const { title, description, published_date, author_id } = req.body;

  const isBookExists = await db<Book>("books").where({ id: bookId }).first();

  if (!isBookExists) throw new ApiError(404, "Book not found");

  await db<Book>("books")
    .where({ id: bookId })
    .update({
      title: title || isBookExists.title,
      description: description || isBookExists.description,
      published_date:
        published_date ||
        new Date(isBookExists.published_date).toISOString().split("T")[0],
      author_id: author_id || isBookExists.author_id,
    });

  const book = await db<Book>("books").where({ id: bookId }).first();

  res
    .status(200)
    .json(new ApiResponse(200, { book }, "Book updated successfully"));
});

const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const bookId = Number(id);

  const deleted = await db<Book>("books").where({ id: bookId }).del();

  if (!deleted) throw new ApiError(404, "Book not found");

  res.status(200).json(new ApiResponse(200, {}, "Book deleted successfully"));
});

const getBooksByAuthorOrTitle = asyncHandler(
  async (req: Request, res: Response) => {
    const { author, title } = req.query;

    if (!author && !title) {
      throw new ApiError(
        400,
        "You must provide either an author name or a book title for search.",
      );
    }

    let query = db("books")
      .select(
        "books.id",
        "books.title",
        "books.description",
        "books.published_date",
        "authors.name as author_name",
      )
      .leftJoin("authors", "books.author_id", "authors.id");

    if (author) {
      query = query.where("authors.name", "like", `%${author}%`);
    }

    if (title) {
      query = query.where("books.title", "like", `%${title}%`);
    }

    const books = await query;

    if (books.length === 0)
      throw new ApiError(404, "No books found matching the search criteria");

    res
      .status(200)
      .json(new ApiResponse(200, books, "Data fetched successfully"));
  },
);

const getBookWithAuthor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const bookId = Number(id);

  const book = await db<Book>("books").where({ id: bookId }).first();
  if (!book) return res.status(404).json({ message: "Book not found" });

  const author = await db<Author>("authors")
    .where({ id: book.author_id })
    .first();

  res
    .status(200)
    .json(new ApiResponse(200, { book, author }, "Data fetched successfully"));
});

export {
  getAllBooks,
  createBook,
  getBookById,
  updateBook,
  deleteBook,
  getBooksByAuthorOrTitle,
  getBookWithAuthor,
};
