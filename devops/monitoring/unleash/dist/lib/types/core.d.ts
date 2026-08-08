import type { Request } from 'express';
import type EventEmitter from 'events';
import type * as https from 'https';
import type * as http from 'http';
import type User from './user';
import type { IAuditUser, IUser } from './user';
import type { IUnleashConfig } from './option';
import type { IUnleashStores } from './stores';
import type { IUnleashServices } from './services';
export interface AuthedRequest extends Request {
    user: User;
}
export interface IUnleash {
    app: any;
    config: IUnleashConfig;
    eventBus: EventEmitter;
    stores: IUnleashStores;
    server?: http.Server | https.Server;
    services: IUnleashServices;
    stop: () => Promise<void>;
    version: string;
}
export declare const SYSTEM_USER: Omit<IUser, 'email'>;
export declare const ADMIN_TOKEN_USER: Omit<IUser, 'email'>;
export declare const SYSTEM_USER_AUDIT: IAuditUser;
export declare const TEST_AUDIT_USER: IAuditUser;
export declare const SYSTEM_USER_ID: number;
//# sourceMappingURL=core.d.ts.map