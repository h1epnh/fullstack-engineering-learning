import { type NextFunction, type Request, type Response } from 'express';

import { ValidationError } from '../utils/custom-error';
import {
  validateEmail,
  validatePassword,
  validatePhone,
} from '../utils/validation.utils';

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, name, phone } = req.body;
  const errors: string[] = [];

  if (!email || !validateEmail(email)) {
    errors.push('Invalid email address');
  }

  if (!password || !validatePassword(password)) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!name || name.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (phone && !validatePhone(phone)) {
    errors.push('Invalid phone number');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email || !validateEmail(email)) {
    errors.push('Invalid email address');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  next();
};
