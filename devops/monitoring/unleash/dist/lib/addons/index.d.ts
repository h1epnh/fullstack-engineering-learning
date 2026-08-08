import type Addon from './addon';
import type { IAddonConfig } from '../types';
export interface IAddonProviders {
    [key: string]: Addon;
}
export declare const getAddons: (args: IAddonConfig) => IAddonProviders;
//# sourceMappingURL=index.d.ts.map