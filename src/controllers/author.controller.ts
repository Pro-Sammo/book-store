import { Request, Response } from "express";
import { validationResult } from "express-validator";
import db from "../database.js";
import { Author } from "../types/author.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/Error.js";
import { Book } from "../types/book.js";

interface CompleteDataType {
  total: string;
  page: number;
  limit: number;
  authors: Record<string, any>;
}

const getAllAuthors = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const offset = (pageNumber - 1) * limitNumber;

  const authors = await db<Author>("authors")
    .select("*")
    .offset(offset)
    .limit(limitNumber);
  const totalAuthors: any = await db<Author>("authors")
    .count("* as count")
    .first();

  const completeDate: CompleteDataType = {
    total: totalAuthors?.count,
    page: pageNumber,
    limit: limitNumber,
    authors: authors,
  };

  res
    .status(200)
    .json(new ApiResponse(200, completeDate, "Data fetched successfully"));
});

const getAuthorById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Number(id);

  const author = await db<Author>("authors").where({ id: userId }).first();

  if (!author) throw new ApiError(404, "Author not found");

  res
    .status(200)
    .json(new ApiResponse(200, author, "Data fetched successfully"));
});

const createAuthor = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, bio, birthdate } = req.body;

  const [newAuthorId] = await db<Author>("authors").insert({
    name,
    bio,
    birthdate,
  });
  const newAuthor = await db<Author>("authors")
    .where({ id: newAuthorId })
    .first();

  if (!newAuthor) {
    throw new ApiError(500, "Something went wrong while creating the author");
  }

  res
    .status(201)
    .json(
      new ApiResponse(201, { newAuthor }, "New Author Created Successfully"),
    );
};

const updateAuthor = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const authorId = Number(id);
  const { name, bio, birthdate } = req.body;
  const isAuthorExists = await db<Author>("authors")
    .where({ id: authorId })
    .first();

  if (!isAuthorExists) throw new ApiError(404, "Author not found");

  await db<Author>("authors")
    .where({ id: authorId })
    .update({
      name: name || isAuthorExists.name,
      bio: bio || isAuthorExists.bio,
      birthdate:
        birthdate ||
        new Date(isAuthorExists.birthdate).toISOString().split("T")[0],
    });

  const author = await db<Author>("authors").where({ id: authorId }).first();

  res
    .status(200)
    .json(new ApiResponse(200, { author }, "Author updated successfully"));
};

const deleteAuthor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const authorId = Number(id);
  const author = await db<Author>("authors").where({ id: authorId }).del();
  if (!author) throw new ApiError(404, "Author not found");
  res.status(200).json(new ApiResponse(200, {}, "Author deleted successfully"));
};

const getAuthorsWithBooks = asyncHandler(
  async (req: Request, res: Response) => {
    const authors = await db<Author>("authors").select("*");
    const authorsWithBooks = await Promise.all(
      authors.map(async (author) => {
        const books = await db<Book>("books").where({ author_id: author.id });
        return { ...author, books };
      }),
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, authorsWithBooks, "Data fetched successfully"),
      );
  },
);

const getAuthorWithBooks = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const authorId = Number(id);

  const author = await db<Author>("authors").where({ id: authorId }).first();

  if (!author) throw new ApiError(404, "Author not found");

  const books = await db<Book>("books").where({ author_id: author.id });

  res
    .status(200)
    .json(new ApiResponse(200, { author, books }, "Data fetched successfully"));
});

export {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorsWithBooks,
  getAuthorWithBooks,
};
