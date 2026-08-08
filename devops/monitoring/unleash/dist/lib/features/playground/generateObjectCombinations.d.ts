type Dict<T> = {
    [K in keyof T]: (string | number)[];
};
export declare const splitByComma: <T extends Record<string, unknown>>(obj: T) => Dict<T>;
export declare const generateCombinations: <T extends Record<string, unknown>>(obj: Dict<T>) => T[];
export declare const generateObjectCombinations: <T extends Record<string, any>>(obj: T) => T[];
export {};
//# sourceMappingURL=generateObjectCombinations.d.ts.map