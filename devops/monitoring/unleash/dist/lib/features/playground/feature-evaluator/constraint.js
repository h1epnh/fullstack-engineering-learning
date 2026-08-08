"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.operators = exports.Operator = void 0;
const semver_1 = require("semver");
const helpers_1 = require("./helpers");
var Operator;
(function (Operator) {
    Operator["IN"] = "IN";
    Operator["NOT_IN"] = "NOT_IN";
    Operator["STR_ENDS_WITH"] = "STR_ENDS_WITH";
    Operator["STR_STARTS_WITH"] = "STR_STARTS_WITH";
    Operator["STR_CONTAINS"] = "STR_CONTAINS";
    Operator["NUM_EQ"] = "NUM_EQ";
    Operator["NUM_GT"] = "NUM_GT";
    Operator["NUM_GTE"] = "NUM_GTE";
    Operator["NUM_LT"] = "NUM_LT";
    Operator["NUM_LTE"] = "NUM_LTE";
    Operator["DATE_AFTER"] = "DATE_AFTER";
    Operator["DATE_BEFORE"] = "DATE_BEFORE";
    Operator["SEMVER_EQ"] = "SEMVER_EQ";
    Operator["SEMVER_GT"] = "SEMVER_GT";
    Operator["SEMVER_LT"] = "SEMVER_LT";
})(Operator || (exports.Operator = Operator = {}));
const cleanValues = (values) => values.filter((v) => !!v).map((v) => v.trim());
const InOperator = (constraint, context) => {
    const field = constraint.contextName;
    const caseInsensitive = Boolean(constraint.caseInsensitive);
    const values = cleanValues(constraint.values);
    const contextValue = (0, helpers_1.resolveContextValue)(context, field);
    const isIn = values.some((val) => caseInsensitive
        ? val.toLowerCase() === contextValue?.toLowerCase()
        : val === contextValue);
    return constraint.operator === Operator.IN ? isIn : !isIn;
};
const StringOperator = (constraint, context) => {
    const { contextName, operator, caseInsensitive } = constraint;
    let values = cleanValues(constraint.values);
    let contextValue = (0, helpers_1.resolveContextValue)(context, contextName);
    if (caseInsensitive) {
        values = values.map((v) => v.toLocaleLowerCase());
        contextValue = contextValue?.toLocaleLowerCase();
    }
    if (operator === Operator.STR_STARTS_WITH) {
        return values.some((val) => contextValue?.startsWith(val));
    }
    if (operator === Operator.STR_ENDS_WITH) {
        return values.some((val) => contextValue?.endsWith(val));
    }
    if (operator === Operator.STR_CONTAINS) {
        return values.some((val) => contextValue?.includes(val));
    }
    return false;
};
const SemverOperator = (constraint, context) => {
    const { contextName, operator } = constraint;
    const value = constraint.value;
    const contextValue = (0, helpers_1.resolveContextValue)(context, contextName);
    if (!contextValue) {
        return false;
    }
    try {
        if (operator === Operator.SEMVER_EQ) {
            return (0, semver_1.eq)(contextValue, value);
        }
        if (operator === Operator.SEMVER_LT) {
            return (0, semver_1.lt)(contextValue, value);
        }
        if (operator === Operator.SEMVER_GT) {
            return (0, semver_1.gt)(contextValue, value);
        }
    }
    catch (e) {
        return false;
    }
    return false;
};
const DateOperator = (constraint, context) => {
    const { operator } = constraint;
    const value = new Date(constraint.value);
    const currentTime = context.currentTime
        ? new Date(context.currentTime)
        : new Date();
    if (operator === Operator.DATE_AFTER) {
        return currentTime > value;
    }
    if (operator === Operator.DATE_BEFORE) {
        return currentTime < value;
    }
    return false;
};
const NumberOperator = (constraint, context) => {
    const field = constraint.contextName;
    const { operator } = constraint;
    const value = Number(constraint.value);
    const contextValue = Number((0, helpers_1.resolveContextValue)(context, field));
    if (Number.isNaN(value) || Number.isNaN(contextValue)) {
        return false;
    }
    if (operator === Operator.NUM_EQ) {
        return contextValue === value;
    }
    if (operator === Operator.NUM_GT) {
        return contextValue > value;
    }
    if (operator === Operator.NUM_GTE) {
        return contextValue >= value;
    }
    if (operator === Operator.NUM_LT) {
        return contextValue < value;
    }
    if (operator === Operator.NUM_LTE) {
        return contextValue <= value;
    }
    return false;
};
exports.operators = new Map();
exports.operators.set(Operator.IN, InOperator);
exports.operators.set(Operator.NOT_IN, InOperator);
exports.operators.set(Operator.STR_STARTS_WITH, StringOperator);
exports.operators.set(Operator.STR_ENDS_WITH, StringOperator);
exports.operators.set(Operator.STR_CONTAINS, StringOperator);
exports.operators.set(Operator.NUM_EQ, NumberOperator);
exports.operators.set(Operator.NUM_LT, NumberOperator);
exports.operators.set(Operator.NUM_LTE, NumberOperator);
exports.operators.set(Operator.NUM_GT, NumberOperator);
exports.operators.set(Operator.NUM_GTE, NumberOperator);
exports.operators.set(Operator.DATE_AFTER, DateOperator);
exports.operators.set(Operator.DATE_BEFORE, DateOperator);
exports.operators.set(Operator.SEMVER_EQ, SemverOperator);
exports.operators.set(Operator.SEMVER_GT, SemverOperator);
exports.operators.set(Operator.SEMVER_LT, SemverOperator);
//# sourceMappingURL=constraint.js.map