import type EventEmitter from 'events';
import type { LogProvider } from '../../logger';
import type { IMaintenanceStatus } from '../maintenance/maintenance-service';
export declare class SchedulerService {
    private intervalIds;
    private logger;
    private maintenanceStatus;
    private eventBus;
    private executingSchedulers;
    constructor(getLogger: LogProvider, maintenanceStatus: IMaintenanceStatus, eventBus: EventEmitter);
    schedule(scheduledFunction: () => Promise<unknown>, timeMs: number, id: string, jitter?: number): Promise<void>;
    stop(): void;
}
//# sourceMappingURL=scheduler-service.d.ts.map