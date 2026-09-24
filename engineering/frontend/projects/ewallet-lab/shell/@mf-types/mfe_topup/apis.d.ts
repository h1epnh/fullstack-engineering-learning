
    export type RemoteKeys = 'mfe_topup/App';
    type PackageType<T> = T extends 'mfe_topup/App' ? typeof import('mfe_topup/App') :any;