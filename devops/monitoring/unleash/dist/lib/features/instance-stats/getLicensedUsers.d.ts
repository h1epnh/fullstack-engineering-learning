import type { Db } from '../../server-impl';
export type GetLicensedUsers = () => Promise<number>;
export declare const createGetLicensedUsers: (db: Db) => GetLicensedUsers;
export declare const createFakeGetLicensedUsers: (licencedUsers?: Awaited<ReturnType<GetLicensedUsers>>) => GetLicensedUsers;
//# sourceMappingURL=getLicensedUsers.d.ts.map