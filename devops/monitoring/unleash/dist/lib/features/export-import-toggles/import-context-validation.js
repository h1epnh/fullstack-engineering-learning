"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidField = void 0;
const isValidField = (importedField, existingFields) => {
    const matchingExistingField = existingFields.find((field) => field.name === importedField.name);
    if (!matchingExistingField) {
        return true;
    }
    return (importedField.legalValues || []).every((value) => (matchingExistingField.legalValues || []).find((v) => v.value === value.value));
};
exports.isValidField = isValidField;
//# sourceMappingURL=import-context-validation.js.map