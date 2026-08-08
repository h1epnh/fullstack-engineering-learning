/**
 * This helper function turns all fields in the item object from camelCase to snake_case
 *
 * @param item is the input object
 * @returns a modified version of item with all fields in snake_case
 */
export declare const defaultToRow: <WriteModel, WriteRow>(item: Partial<WriteModel>) => Partial<WriteRow>;
/**
 * This helper function turns all fields in the row object from snake_case to camelCase
 * @param row is the input object
 * @returns a modified version of row with all fields in camelCase
 */
export declare const defaultFromRow: <ReadModel, ReadRow>(row: Partial<ReadRow>) => Partial<ReadModel>;
//# sourceMappingURL=default-mappings.d.ts.map