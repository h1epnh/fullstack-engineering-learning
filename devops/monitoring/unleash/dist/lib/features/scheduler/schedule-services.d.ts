import type { IUnleashConfig, IUnleashServices } from '../../server-impl';
/**
 * Schedules service methods.
 *
 * In order to promote runtime control, you should **not use** a flagResolver inside this method. Instead, implement your flag usage inside the scheduled methods themselves.
 * @param services
 */
export declare const scheduleServices: (services: IUnleashServices, config: IUnleashConfig) => Promise<void>;
//# sourceMappingURL=schedule-services.d.ts.map