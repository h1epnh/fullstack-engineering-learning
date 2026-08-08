import type { IUnleashConfig } from '../types/option';
import { type ProductivityReportMetrics } from '../features/productivity-report/productivity-report-view-model';
export interface IAuthOptions {
    user: string;
    pass: string;
}
export declare enum TemplateFormat {
    HTML = "html",
    PLAIN = "plain"
}
export declare enum TransporterType {
    SMTP = "smtp",
    JSON = "json"
}
export interface IEmailEnvelope {
    from: string;
    to: string;
    bcc?: string;
    subject: string;
    html: string;
    text: string;
    attachments?: {
        filename: string;
        path: string;
        cid: string;
    }[];
    headers?: Record<string, string>;
}
export declare const MAIL_ACCEPTED = "250 Accepted";
export type ChangeRequestScheduleConflictData = {
    reason: 'flag archived';
    flagName: string;
} | {
    reason: 'strategy deleted';
    flagName: string;
    strategyId: string;
} | {
    reason: 'strategy updated';
    flagName: string;
    strategyId: string;
} | {
    reason: 'segment updated';
    segment: {
        id: number;
        name: string;
    };
} | {
    reason: 'environment variants updated';
    flagName: string;
    environment: string;
};
export declare class EmailService {
    private logger;
    private config;
    private readonly mailer?;
    private readonly sender;
    constructor(config: IUnleashConfig);
    sendScheduledExecutionFailedEmail(recipient: string, changeRequestLink: string, changeRequestTitle: string, scheduledAt: string, errorMessage: string): Promise<IEmailEnvelope>;
    sendScheduledChangeConflictEmail(recipient: string, conflictScope: 'flag' | 'strategy', conflictingChangeRequestId: number | undefined, changeRequests: {
        id: number;
        scheduledAt: string;
        link: string;
        title?: string;
    }[], flagName: string, project: string, strategyId?: string): Promise<unknown>;
    sendScheduledChangeSuspendedEmail(recipient: string, conflictData: ChangeRequestScheduleConflictData, conflictingChangeRequestId: number | undefined, changeRequests: {
        id: number;
        scheduledAt: string;
        link: string;
        title?: string;
    }[], project: string): Promise<unknown>;
    sendResetMail(name: string, recipient: string, resetLink: string): Promise<IEmailEnvelope>;
    sendGettingStartedMail(name: string, recipient: string, unleashUrl: string, passwordLink?: string): Promise<IEmailEnvelope>;
    sendProductivityReportEmail(userEmail: string, userName: string, metrics: ProductivityReportMetrics): Promise<IEmailEnvelope>;
    isEnabled(): boolean;
    compileTemplate(templateName: string, format: TemplateFormat, context: unknown): Promise<string>;
    private resolveTemplate;
    private resolveTemplateAttachment;
    configured(): boolean;
    stripSpecialCharacters(str: string): string;
}
//# sourceMappingURL=email-service.d.ts.map