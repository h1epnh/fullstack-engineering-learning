"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadIndexHTML = loadIndexHTML;
const fs_1 = __importDefault(require("fs"));
const rewriteHTML_1 = require("./rewriteHTML");
const path_1 = __importDefault(require("path"));
const make_fetch_happen_1 = __importDefault(require("make-fetch-happen"));
async function loadIndexHTML(config, publicFolder) {
    const { cdnPrefix, baseUriPath = '' } = config.server;
    const uiFlags = encodeURI(JSON.stringify(config.ui.flags || '{}'));
    let indexHTML;
    if (cdnPrefix) {
        const res = await (0, make_fetch_happen_1.default)(`${cdnPrefix}/index.html`);
        indexHTML = await res.text();
    }
    else {
        indexHTML = fs_1.default
            .readFileSync(path_1.default.join(config.publicFolder || publicFolder, 'index.html'))
            .toString();
    }
    return (0, rewriteHTML_1.rewriteHTML)(indexHTML, baseUriPath, cdnPrefix, uiFlags);
}
//# sourceMappingURL=load-index-html.js.map