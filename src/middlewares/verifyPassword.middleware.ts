import db from "../database.js";
import bcrypt from "bcryptjs";
import { User } from "../types/user.js";
import { asyncHandler } from "../utils/asyncHandler.js";

type isMatchType = true | false;

export const verifyUserPassword = async (email: string, password: string) => {
  const user = await db<User>("users").where({ email }).first();

  if (!user) {
    return false;
  }

  const isMatch: isMatchType = await bcrypt.compare(password, user.password);

  return isMatch;
};
