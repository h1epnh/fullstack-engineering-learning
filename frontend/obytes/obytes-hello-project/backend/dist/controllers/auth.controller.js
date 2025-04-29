"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const error_utils_1 = require("../utils/error.utils");
class AuthController {
    constructor() {
        this.login = async (req, res) => {
            try {
                // const { email, password } = req.body;
                const result = await this.authService.login(req.body);
                res.json(result);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.register = async (req, res) => {
            try {
                const userData = req.body;
                const result = await this.authService.register(userData);
                res.status(201).json(result);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.authService = new auth_service_1.AuthService();
    }
}
exports.AuthController = AuthController;
