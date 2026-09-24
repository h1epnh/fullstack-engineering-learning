
    export type RemoteKeys = 'mfe_auth/App';
    type PackageType<T> = T extends 'mfe_auth/App' ? typeof import('mfe_auth/App') :any;