"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = require("../../types/permissions");
const email_service_1 = require("../../services/email-service");
const controller_1 = __importDefault(require("../controller"));
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
class EmailController extends controller_1.default {
    constructor(config, { emailService }) {
        super(config);
        this.emailService = emailService;
        this.logger = config.getLogger('routes/admin-api/email');
        this.get('/preview/html/:template', this.getHtmlPreview, permissions_1.ADMIN);
        this.get('/preview/text/:template', this.getTextPreview, permissions_1.ADMIN);
    }
    async getHtmlPreview(req, res) {
        const { template } = req.params;
        const ctx = req.query;
        const data = await this.emailService.compileTemplate((0, sanitize_filename_1.default)(template), email_service_1.TemplateFormat.HTML, ctx);
        res.setHeader('Content-Type', 'text/html');
        res.status(200);
        res.send(data);
        res.end();
    }
    async getTextPreview(req, res) {
        const { template } = req.params;
        const ctx = req.query;
        const data = await this.emailService.compileTemplate((0, sanitize_filename_1.default)(template), email_service_1.TemplateFormat.PLAIN, ctx);
        res.setHeader('Content-Type', 'text/plain');
        res.status(200);
        res.send(data);
        res.end();
    }
}
exports.default = EmailController;
module.exports = EmailController;
//# sourceMappingURL=email.js.map