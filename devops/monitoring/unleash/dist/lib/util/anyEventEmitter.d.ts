import EventEmitter from 'events';
export declare const ANY_EVENT = "*";
export declare class AnyEventEmitter extends EventEmitter {
    emit(type: string, ...args: any[]): boolean;
}
export declare const sharedEventEmitter: AnyEventEmitter;
//# sourceMappingURL=anyEventEmitter.d.ts.map