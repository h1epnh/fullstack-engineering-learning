
    export type RemoteKeys = 'mfe_wallet/Home' | 'mfe_wallet/History';
    type PackageType<T> = T extends 'mfe_wallet/History' ? typeof import('mfe_wallet/History') :T extends 'mfe_wallet/Home' ? typeof import('mfe_wallet/Home') :any;