export class CustomError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: any[]
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(errors: any[]) {
    super(400, 'Validation Error', errors);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = 'Not Found') {
    super(404, message);
  }
}
