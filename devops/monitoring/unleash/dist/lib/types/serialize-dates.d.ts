type SerializedDates<T> = T extends Date ? string : T extends object ? {
    [P in keyof T]: SerializedDates<T[P]>;
} : T;
export declare const serializeDates: <T>(obj: T) => SerializedDates<T>;
export {};
//# sourceMappingURL=serialize-dates.d.ts.map