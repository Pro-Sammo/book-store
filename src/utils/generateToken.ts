import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET_KEY as string;

export const generateAccessToken = (username: string) => {
  return jwt.sign({ username: username }, secretKey, { expiresIn: "12h" });
};
