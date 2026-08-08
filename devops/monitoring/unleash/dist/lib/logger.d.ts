export type LogProvider = (category?: string) => Logger;
export declare enum LogLevel {
    debug = "debug",
    info = "info",
    warn = "warn",
    error = "error",
    fatal = "fatal"
}
export interface Logger {
    debug(message: any, ...args: any[]): void;
    info(message: any, ...args: any[]): void;
    warn(message: any, ...args: any[]): void;
    error(message: any, ...args: any[]): void;
    fatal(message: any, ...args: any[]): void;
}
export declare function getDefaultLogProvider(logLevel?: LogLevel): LogProvider;
export declare function validateLogProvider(provider: LogProvider): void;
//# sourceMappingURL=logger.d.ts.map