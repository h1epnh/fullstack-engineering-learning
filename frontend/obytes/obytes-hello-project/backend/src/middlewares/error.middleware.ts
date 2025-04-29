import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/custom-error';

interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: unknown;
  stack?: string;
}

const sendError = (
  res: Response,
  status: number,
  message: string,
  errors?: unknown
): Response<ErrorResponse> => {
  const response: ErrorResponse = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = new Error().stack;
  }

  return res.status(status).json(response);
};

export const errorMiddleware = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  // Handle CustomError
  if (err instanceof CustomError) {
    return sendError(
      res,
      err.status,
      err.message,
      err.details
    );
  }

  // Handle default Error
  console.error('Unhandled Error:', err);
  return sendError(
    res,
    500,
    'Internal Server Error',
    process.env.NODE_ENV === 'development' ? err.message : undefined
  );
};

// Async error handler wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
