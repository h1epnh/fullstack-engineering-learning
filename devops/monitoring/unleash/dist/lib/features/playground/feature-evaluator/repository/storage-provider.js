"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageProvider = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const helpers_1 = require("../helpers");
const { writeFile, readFile } = fs_1.promises;
class FileStorageProvider {
    constructor(backupPath) {
        if (!backupPath) {
            throw new Error('backup Path is required');
        }
        this.backupPath = backupPath;
    }
    getPath(key) {
        return (0, path_1.join)(this.backupPath, `/unleash-backup-${(0, helpers_1.safeName)(key)}.json`);
    }
    async set(key, data) {
        return writeFile(this.getPath(key), JSON.stringify(data));
    }
    async get(key) {
        const path = this.getPath(key);
        let data;
        try {
            data = await readFile(path, 'utf8');
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
            else {
                return undefined;
            }
        }
        if (!data || data.trim().length === 0) {
            return undefined;
        }
        try {
            return JSON.parse(data);
        }
        catch (error) {
            if (error instanceof Error) {
                error.message = `Unleash storage failed parsing file ${path}: ${error.message}`;
            }
            throw error;
        }
    }
}
exports.FileStorageProvider = FileStorageProvider;
//# sourceMappingURL=storage-provider.js.map