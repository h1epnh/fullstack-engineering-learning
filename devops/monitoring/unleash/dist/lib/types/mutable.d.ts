export type DeepMutable<T> = {
    -readonly [P in keyof T]: DeepMutable<T[P]>;
};
export type DeepImmutable<T> = {
    readonly [P in keyof T]: DeepImmutable<T[P]>;
};
//# sourceMappingURL=mutable.d.ts.map