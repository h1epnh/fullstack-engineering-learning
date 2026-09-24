import { type LinkedBankAccount } from '@ewallet-lab/api-client';
export declare function TopupAmount({ account, onSubmit, }: {
    account: LinkedBankAccount;
    onSubmit: (amount: number) => Promise<void>;
}): import("react").JSX.Element;
