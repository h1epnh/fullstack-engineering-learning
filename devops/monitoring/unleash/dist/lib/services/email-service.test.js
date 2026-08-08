"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const email_service_1 = require("./email-service");
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
test('Can send reset email', async () => {
    const emailService = new email_service_1.EmailService({
        email: {
            host: 'test',
            port: 587,
            secure: false,
            smtpuser: '',
            smtppass: '',
            sender: 'noreply@getunleash.ai',
        },
        getLogger: no_logger_1.default,
    });
    const resetLinkUrl = 'https://unleash-hosted.com/reset-password?token=$2b$10$M06Ysso6KL4ueH/xR6rdSuY5GSymdIwmIkEUJMRkB.Qn26r5Gi5vW';
    const content = await emailService.sendResetMail('Some username', 'test@resetLinkUrl.com', resetLinkUrl);
    expect(content.from).toBe('noreply@getunleash.ai');
    expect(content.subject).toBe('Unleash - Reset your password');
    expect(content.html.includes(resetLinkUrl)).toBe(true);
    expect(content.text.includes(resetLinkUrl)).toBe(true);
});
test('Can send welcome mail', async () => {
    const emailService = new email_service_1.EmailService({
        email: {
            host: 'test',
            port: 587,
            secure: false,
            smtpuser: '',
            smtppass: '',
            sender: 'noreply@getunleash.ai',
        },
        getLogger: no_logger_1.default,
    });
    const content = await emailService.sendGettingStartedMail('Some username', 'test@test.com', 'abc123456');
    expect(content.from).toBe('noreply@getunleash.ai');
    expect(content.subject).toBe('Welcome to Unleash');
});
test('Can supply additional SMTP transport options', async () => {
    const spy = jest.spyOn(nodemailer_1.default, 'createTransport');
    new email_service_1.EmailService({
        email: {
            host: 'smtp.unleash.test',
            port: 9999,
            secure: false,
            sender: 'noreply@getunleash.ai',
            transportOptions: {
                tls: {
                    rejectUnauthorized: true,
                },
            },
        },
        getLogger: no_logger_1.default,
    });
    expect(spy).toHaveBeenCalledWith({
        auth: {
            user: '',
            pass: '',
        },
        host: 'smtp.unleash.test',
        port: 9999,
        secure: false,
        tls: {
            rejectUnauthorized: true,
        },
    });
});
test('should strip special characters from email subject', async () => {
    const emailService = new email_service_1.EmailService({
        email: {
            host: 'test',
            port: 587,
            secure: false,
            smtpuser: '',
            smtppass: '',
            sender: 'noreply@getunleash.ai',
        },
        getLogger: no_logger_1.default,
    });
    expect(emailService.stripSpecialCharacters('http://evil.com')).toBe('httpevilcom');
    expect(emailService.stripSpecialCharacters('http://ööbik.com')).toBe('httpööbikcom');
    expect(emailService.stripSpecialCharacters('tom-jones')).toBe('tom-jones');
});
test('Can send productivity report email', async () => {
    const emailService = new email_service_1.EmailService({
        server: {
            unleashUrl: 'http://localhost',
        },
        email: {
            host: 'test',
            port: 587,
            secure: false,
            smtpuser: '',
            smtppass: '',
            sender: 'noreply@getunleash.ai',
        },
        getLogger: no_logger_1.default,
    });
    const content = await emailService.sendProductivityReportEmail('user@user.com', 'customerId', {
        flagsCreated: 1,
        productionUpdates: 2,
        health: 99,
        previousMonth: {
            health: 89,
            flagsCreated: 1,
            productionUpdates: 3,
        },
    });
    expect(content.from).toBe('noreply@getunleash.ai');
    expect(content.subject).toBe('Unleash - productivity report');
    expect(content.html.includes('Productivity Report')).toBe(true);
    expect(content.html.includes('localhost/insights')).toBe(true);
    expect(content.html.includes('localhost/profile')).toBe(true);
    expect(content.html.includes('#68a611')).toBe(true);
    expect(content.html.includes('10% more than previous month')).toBe(true);
    expect(content.text.includes('localhost/insights')).toBe(true);
    expect(content.text.includes('localhost/profile')).toBe(true);
    expect(content.text.includes('localhost/profile')).toBe(true);
});
test('Should add optional headers to productivity email', async () => {
    const emailService = new email_service_1.EmailService({
        server: {
            unleashUrl: 'http://localhost',
        },
        email: {
            host: 'test',
            port: 587,
            secure: false,
            smtpuser: '',
            smtppass: '',
            sender: 'noreply@getunleash.ai',
            optionalHeaders: {
                'x-header-name': 'value',
            },
        },
        getLogger: no_logger_1.default,
    });
    const passwordResetMail = await emailService.sendResetMail('name', 'user@example.com', 'http://exempla.com');
    const productivityMail = await emailService.sendProductivityReportEmail('user@user.com', 'customerId', {
        flagsCreated: 1,
        productionUpdates: 2,
        health: 99,
        previousMonth: null,
    });
    expect(passwordResetMail.headers).toBeFalsy();
    expect(productivityMail.headers).toStrictEqual({
        'x-header-name': 'value',
    });
});
//# sourceMappingURL=email-service.test.js.map