import type { ILegalValue } from '../../features/context/context-field-store-type';
export declare const validateNumber: (value: unknown) => Promise<void>;
export declare const validateString: (value: unknown) => Promise<void>;
export declare const validateSemver: (value: unknown) => void;
export declare const validateDate: (value: unknown) => Promise<void>;
export declare const validateLegalValues: (legalValues: Readonly<ILegalValue[]>, match: string[] | string) => void;
//# sourceMappingURL=constraint-types.d.ts.map