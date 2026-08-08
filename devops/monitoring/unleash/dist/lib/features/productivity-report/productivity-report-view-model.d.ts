export type ProductivityReportMetrics = {
    health: number;
    flagsCreated: number;
    productionUpdates: number;
    previousMonth: {
        health: number;
        flagsCreated: number;
        productionUpdates: number;
    } | null;
};
export declare const productivityReportViewModel: ({ unleashUrl, userEmail, userName, metrics, }: {
    unleashUrl: string;
    userEmail: string;
    userName: string;
    metrics: ProductivityReportMetrics;
}) => {
    unleashUrl: string;
    healthColor(): "#d93644" | "#68a611" | "#d76500";
    actionText(): string | null;
    healthTrendMessage(): string | null;
    flagsCreatedTrendMessage(): string | null;
    productionUpdatedTrendMessage(): string | null;
    previousMonthText(unit: "" | "%", currentValue: number, previousValue?: number): string | null;
    health: number;
    flagsCreated: number;
    productionUpdates: number;
    previousMonth: {
        health: number;
        flagsCreated: number;
        productionUpdates: number;
    } | null;
    userName: string;
    userEmail: string;
};
//# sourceMappingURL=productivity-report-view-model.d.ts.map