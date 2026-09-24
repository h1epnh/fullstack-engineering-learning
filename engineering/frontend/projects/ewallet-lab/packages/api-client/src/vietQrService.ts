import { http } from './http';

/** Exact shape of https://api.vietqr.io/v2/banks — verified live, not guessed. */
export type VietQrBank = {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name: string;
  support: number;
  isTransfer: number;
  swift_code: string;
};

type VietQrBanksResponse = {
  code: string;
  desc: string;
  data: VietQrBank[];
};

const VIETQR_BANKS_URL = 'https://api.vietqr.io/v2/banks';
const CACHE_KEY = 'ewallet-lab-vietqr-banks';
// VietQR's own docs: the list rarely changes and recommend caching it (they suggest a daily
// refresh) rather than calling on every screen load.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type Cache = { fetchedAt: number; banks: VietQrBank[] };

function readCache(): VietQrBank[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as Cache;
    if (Date.now() - cache.fetchedAt > CACHE_TTL_MS) return null;
    return cache.banks;
  } catch {
    return null;
  }
}

function writeCache(banks: VietQrBank[]): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), banks } satisfies Cache));
  } catch {
    // best-effort only — see session.ts's saveSession for the same pattern
  }
}

export const vietQrService = {
  /**
   * Real, public NAPAS/VietQR bank directory (no API key, CORS-open) — see
   * https://www.vietqr.io/en/danh-sach-api/api-danh-sach-ma-ngan-hang. Only `support === 3`
   * banks are returned (VietQR's own highest tier, i.e. what a real transfer/QR flow would
   * actually offer). VietQR also lists e-wallets as interbank participants — its "momo" entry is
   * filtered out here, since this lab never renders MoMo's own name/logo (see DESIGN.md).
   */
  async listBanks(): Promise<VietQrBank[]> {
    const cached = readCache();
    if (cached) return cached;
    const res = await http.get<VietQrBanksResponse>(VIETQR_BANKS_URL);
    const banks = res.data.filter((b) => b.support === 3 && b.code.toLowerCase() !== 'momo');
    writeCache(banks);
    return banks;
  },
};
