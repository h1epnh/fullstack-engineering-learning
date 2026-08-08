"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFromRow = exports.defaultToRow = void 0;
const camelToSnakeCase = (str) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const snakeToCamelCase = (str) => str.replace(/(_\w)/g, (letter) => letter[1].toUpperCase());
/**
 * This helper function turns all fields in the item object from camelCase to snake_case
 *
 * @param item is the input object
 * @returns a modified version of item with all fields in snake_case
 */
const defaultToRow = (item) => {
    const row = {};
    Object.entries(item).forEach(([key, value]) => {
        row[camelToSnakeCase(key)] = value;
    });
    return row;
};
exports.defaultToRow = defaultToRow;
/**
 * This helper function turns all fields in the row object from snake_case to camelCase
 * @param row is the input object
 * @returns a modified version of row with all fields in camelCase
 */
const defaultFromRow = (row) => {
    const model = {};
    Object.entries(row).forEach(([key, value]) => {
        model[snakeToCamelCase(key)] = value;
    });
    return model;
};
exports.defaultFromRow = defaultFromRow;
//# sourceMappingURL=default-mappings.js.map