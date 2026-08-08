export type Saved<T extends {}, Id extends string | number = string> = T & {
    id: Id;
};
export type Unsaved<T extends {}> = Omit<T, 'id'>;
//# sourceMappingURL=saved.d.ts.map