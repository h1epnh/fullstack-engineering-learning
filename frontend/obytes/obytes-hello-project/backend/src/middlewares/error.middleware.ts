import { type NextFunction, type Request, type Response } from 'express';

import { CustomError } from '../utils/custom-error';
import logger from '../utils/logger.utils';
import { sendError } from '../utils/response.utils';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err);

  if (err instanceof CustomError) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  if (err.name === 'ValidationError') {
    return sendError(res, 400, 'Validation Error', [err.message]);
  }

  if (err.name === 'UnauthorizedError') {
    return sendError(res, 401, 'Unauthorized');
  }

  return sendError(res, 500, 'Internal Server Error');
};
