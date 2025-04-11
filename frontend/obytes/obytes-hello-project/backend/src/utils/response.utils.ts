import { type Response } from 'express';

import { type ApiResponse } from '../types';

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message?: string
) => {
  const response: ApiResponse<T> = {
    success: statusCode < 400,
    data,
    message,
  };

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: any[]
) => {
  const response: ApiResponse<null> = {
    success: false,
    error: message,
    data: null,
  };

  return res.status(statusCode).json(response);
};
