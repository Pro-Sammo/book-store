import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/Error.js";
import { User } from "../types/user.js";
import db from "../database.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { generateAccessToken } from "../utils/generateToken.js";
import { verifyUserPassword } from "../middlewares/verifyPassword.middleware.js";

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, username, password } = req.body;

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await db<User>("users")
    .where({ username })
    .orWhere({ email })
    .first();

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const hashPassword = await bcrypt.hash(password, 12);

  const [newUserId] = await db<User>("users").insert({
    fullname: fullname,
    username: username,
    email: email,
    password: hashPassword,
  });

  const createdUser = await db<User>("users")
    .select("fullname", "username", "email")
    .where({ id: newUserId })
    .first();

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and Password is required");
  }

  const user = await db<User>("users").where({ email }).first();

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  const isPasswordValid = await verifyUserPassword(user.email, password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const accessToken = generateAccessToken(user.username);

  const loggedInUser = await db<User>("users")
    .select("fullname", "username", "email")
    .where({ id: user.id });

  let options = {
    httpOnly: true,
    secure: true,
  };

  return res.cookie("accessToken", accessToken, options).json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
        accessToken,
      },
      "User logged in successfully",
    ),
  );
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  let options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

export { registerUser, loginUser, logoutUser };
