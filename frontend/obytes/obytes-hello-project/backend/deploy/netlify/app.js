"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./docs/swagger");
const env_1 = require("./config/env");
const error_middleware_1 = require("./middlewares/error.middleware");
const rate_limit_middleware_1 = require("./middlewares/rate-limit.middleware");
const security_middleware_1 = require("./middlewares/security.middleware");
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const service_routes_1 = __importDefault(require("./routes/service.routes"));
const staff_routes_1 = __importDefault(require("./routes/staff.routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(rate_limit_middleware_1.rateLimiter);
app.use(security_middleware_1.securityMiddleware);
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/services', service_routes_1.default);
app.use('/api/appointments', appointment_routes_1.default);
app.use('/api/staff', staff_routes_1.default);
// Swagger UI
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Nail Salon API Documentation"
}));
// Error handling
app.use(error_middleware_1.errorMiddleware);
const PORT = env_1.config.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
