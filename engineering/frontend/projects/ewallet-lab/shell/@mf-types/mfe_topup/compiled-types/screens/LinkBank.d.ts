import { type LinkedBankAccount } from '@ewallet-lab/api-client';
export declare function LinkBank({ onLink, onLinked, }: {
    onLink: (bankCode: string, accountNumber: string) => Promise<LinkedBankAccount>;
    onLinked: (account: LinkedBankAccount) => void;
}): import("react").JSX.Element;
