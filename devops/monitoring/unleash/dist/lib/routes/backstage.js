"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackstageController = void 0;
const v8_1 = require("v8");
const os_1 = require("os");
const path_1 = require("path");
const prom_client_1 = require("prom-client");
const controller_1 = __importDefault(require("./controller"));
class BackstageController extends controller_1.default {
    constructor(config) {
        super(config);
        this.logger = config.getLogger('backstage.js');
        if (config.server.serverMetrics) {
            this.get('/prometheus', async (req, res) => {
                res.set('Content-Type', prom_client_1.register.contentType);
                res.end(await prom_client_1.register.metrics());
            });
        }
        if (config.server.enableHeapSnapshotEnpoint) {
            this.get('/heap-snapshot', async (req, res) => {
                const fileName = (0, path_1.join)((0, os_1.tmpdir)(), `unleash-${Date.now()}.heapsnapshot`);
                (0, v8_1.writeHeapSnapshot)(fileName);
                res.status(200);
                res.end('Snapshot written');
            });
        }
    }
}
exports.BackstageController = BackstageController;
//# sourceMappingURL=backstage.js.map