import { type Response } from 'express';

export const handleError = (res: Response, error: any) => {
  console.error(error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: error.errors,
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  return res.status(500).json({
    message: 'Internal Server Error',
  });
};
