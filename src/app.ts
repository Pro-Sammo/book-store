import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});

const app: Express = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

import authorRoute from "./routes/author.route.js";
import userRoute from "./routes/user.route.js";
import bookRoute from "./routes/book.route.js";

app.use("/api/v1", authorRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", bookRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is working");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running no port no. ${4000}`);
});

export { app };
