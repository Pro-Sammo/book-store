import { ApiError } from "../utils/Error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import db from "../database.js";
import { User } from "../types/user.js";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string;

export const verifyJWT = asyncHandler(
  async (req: Request, _, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken: any = jwt.verify(token, JWT_SECRET_KEY);
    const user = await db<User>("users")
      .select("username")
      .where({ username: decodedToken?.username });

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    next();
  },
);
