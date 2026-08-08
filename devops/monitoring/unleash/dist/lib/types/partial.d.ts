export type PartialDeep<T> = T extends object ? {
    [P in keyof T]?: PartialDeep<T[P]>;
} : T;
export type PartialSome<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type WithRequired<T, K extends keyof T> = T & {
    [P in K]-?: T[P];
};
//# sourceMappingURL=partial.d.ts.map