export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  DATABASE = 'DATABASE_ERROR',
  BUSINESS = 'BUSINESS_ERROR',
  SYSTEM = 'SYSTEM_ERROR'
}

export class CustomError extends Error {
  constructor(
    public readonly type: ErrorType,
    message: string,
    public readonly status: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(errors: any[]) {
    super(ErrorType.VALIDATION, 'Validation Error', 400, { errors });
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = 'Unauthorized') {
    super(ErrorType.AUTHENTICATION, message, 401);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = 'Not Found') {
    super(ErrorType.NOT_FOUND, message, 404);
  }
}

// Error Factory class
export class ErrorFactory {
  static validation(message: string, details?: Record<string, unknown>): CustomError {
    return new CustomError(ErrorType.VALIDATION, message, 400, details);
  }

  static authentication(message: string): CustomError {
    return new CustomError(ErrorType.AUTHENTICATION, message, 401);
  }

  static authorization(message: string): CustomError {
    return new CustomError(ErrorType.AUTHORIZATION, message, 403);
  }

  static notFound(resource: string): CustomError {
    return new CustomError(ErrorType.NOT_FOUND, `${resource} not found`, 404);
  }

  static system(message: string, details?: Record<string, unknown>): CustomError {
    return new CustomError(ErrorType.SYSTEM, message, 500, details);
  }

  static database(message: string, details?: Record<string, unknown>): CustomError {
    return new CustomError(ErrorType.DATABASE, message, 500, details);
  }

  static business(message: string, details?: Record<string, unknown>): CustomError {
    return new CustomError(ErrorType.BUSINESS, message, 422, details);
  }
}
