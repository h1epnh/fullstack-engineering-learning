import { type Request, type Response } from 'express';

import { AuthService } from '../services/auth.service';
import { handleError } from '../utils/error.utils';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      const result = await this.authService.register(userData);
      res.status(201).json(result);
    } catch (error) {
      handleError(res, error);
    }
  };
}
