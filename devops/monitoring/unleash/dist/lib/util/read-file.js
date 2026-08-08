"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFile = void 0;
const fs_1 = require("fs");
const readFile = async (file) => await fs_1.promises.readFile(file, 'utf-8');
exports.readFile = readFile;
//# sourceMappingURL=read-file.js.map