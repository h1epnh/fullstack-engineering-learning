export type Nguon = { tieu_de: string; url: string; ngay_truy_cap: string };

export type CentralAgency = { id: string; ten: string; loai: 'bo' | 'co_quan_ngang_bo' };
export type CentralAgenciesFile = {
  nhiem_ky: string;
  hieu_luc_tu: string;
  items: CentralAgency[];
  nguon: Nguon[];
};

export type AgencyHead = {
  co_quan_id: string;
  chuc_danh: string;
  ten_nguoi_dung_dau: string;
  ghi_chu?: string;
};
export type AgencyHeadsFile = {
  nhiem_ky: string;
  thu_tuong: string;
  pho_thu_tuong: { ten: string; ghi_chu?: string }[];
  items: AgencyHead[];
  nguon: Nguon[];
};

export type DepartmentItem = {
  id: string;
  ten: string;
  nhom: 'bat_buoc' | 'dac_thu';
  dieu_khoan: string;
  dieu_kien?: string;
};
export type DepartmentFrameworkFile = {
  can_cu_phap_ly: string;
  ghi_chu_sua_doi: string;
  so_luong_toi_da: { tinh_thanh_thuong: number; ha_noi_va_ho_chi_minh: number };
  items: DepartmentItem[];
  nguon: Nguon[];
};

export type Province = {
  id: string;
  ten: string;
  loai: 'tinh' | 'thanh_pho_tw';
  sap_nhap: boolean;
  don_vi_cu: string[] | null;
};
export type ProvincesFile = {
  nghi_quyet: string;
  hieu_luc_tu: string;
  items: Province[];
  nguon: Nguon[];
};

export type BudgetSplit = { tong: number; trung_uong: number; dia_phuong: number };
export type BudgetYear = {
  nam: number;
  nghi_quyet: string;
  ngay_thong_qua: string;
  don_vi: 'ty_dong';
  tong_thu: BudgetSplit;
  tong_chi: BudgetSplit;
  boi_chi: BudgetSplit & { phan_tram_gdp: number };
  luong_co_so_dong_thang: number;
  nguon: Nguon[];
};
export type StateBudgetFile = { items: BudgetYear[] };
