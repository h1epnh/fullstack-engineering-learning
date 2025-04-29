import { Request, Response, NextFunction } from 'express';

interface PaginationQuery {
  page?: string;
  limit?: string;
}

export const paginationMiddleware = (
  req: Request<{}, {}, {}, PaginationQuery>,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);

  // Validate pagination parameters
  const validatedPage = page > 0 ? page : 1;
  const validatedLimit = limit > 0 && limit <= 100 ? limit : 10;

  req.pagination = {
    page: validatedPage,
    limit: validatedLimit,
    skip: (validatedPage - 1) * validatedLimit
  };

  next();
};
