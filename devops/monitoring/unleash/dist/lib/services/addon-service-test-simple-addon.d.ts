import Addon from '../addons/addon';
import { type IEvent } from '../types/events';
export default class SimpleAddon extends Addon {
    events: any[];
    constructor();
    getEvents(): any[];
    handleEvent(event: IEvent, parameters: any): Promise<void>;
}
//# sourceMappingURL=addon-service-test-simple-addon.d.ts.map