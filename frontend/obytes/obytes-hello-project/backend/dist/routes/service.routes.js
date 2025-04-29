"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_controller_1 = require("../controllers/service.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const serviceController = new service_controller_1.ServiceController();
// Public routes
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
// Protected routes
router.post('/', auth_middleware_1.authMiddleware, serviceController.createService);
router.put('/:id', auth_middleware_1.authMiddleware, serviceController.updateService);
router.delete('/:id', auth_middleware_1.authMiddleware, serviceController.deleteService);
exports.default = router;
