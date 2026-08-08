import type EventEmitter from 'events';
declare const metricsHelper: {
    wrapTimer: (eventBus: EventEmitter, event: string, args?: Record<string, unknown>) => (data: unknown) => unknown;
};
export default metricsHelper;
//# sourceMappingURL=metrics-helper.d.ts.map