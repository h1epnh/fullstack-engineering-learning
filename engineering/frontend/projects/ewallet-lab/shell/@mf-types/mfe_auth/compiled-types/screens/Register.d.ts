export declare function Register({ phone, onBack, onSubmit, }: {
    phone: string;
    onBack: () => void;
    onSubmit: (phone: string, name: string) => Promise<string | null>;
}): import("react").JSX.Element;
