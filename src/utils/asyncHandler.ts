import { Request, Response, NextFunction } from "express";

type functionType = (req: Request, res: Response, next: NextFunction) => void;

const asyncHandler = (requestHandler: functionType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
