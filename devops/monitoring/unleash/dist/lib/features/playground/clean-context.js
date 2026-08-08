"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanContext = void 0;
const cleanContext = (context) => {
    const { appName, ...otherContextFields } = context;
    const removedProperties = [];
    const cleanedContextFields = Object.fromEntries(Object.entries(otherContextFields).filter(([key, value]) => {
        if (key === 'properties' || typeof value === 'string') {
            return true;
        }
        removedProperties.push(key);
        return false;
    }));
    return {
        context: {
            ...cleanedContextFields,
            appName,
        },
        removedProperties,
    };
};
exports.cleanContext = cleanContext;
//# sourceMappingURL=clean-context.js.map