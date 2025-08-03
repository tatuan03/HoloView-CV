// src/types/index.ts

export interface Skill {
  TenKyNang: string;
}

export interface Experience {
  TenCongTy: string | null;
  ViTri: string | null;
}

export interface Interview {
  MaLichPV: number;
  VongPhongVan: string;
  ThoiGian: string;
  KetQua: string | null;
  GhiChuCuaNguoiPhongVan: string | null;
}

export interface Offer {
  MaOffer: number;
  NgayGuiOffer: string;
  PhanHoiUngVien: string;
}

export interface Activity {
  MaHoatDong: number;
  HanhDong: string;
  ThoiGian: string;
  NguoiThucHien: { HoTen: string } | null;
}

export interface Note {
  MaGhiChu: number;
  NoiDung: string;
  ThoiGianTao: string;
  NguoiTao: { HoTen: string } | null;
}

export interface ApplicationProcess {
  MaQuyTrinh: string;
  TrangThaiHienTai: string;
  LichPhongVan: Interview[];
  DeXuatTuyenDung: Offer[];
  LichSuHoatDong: Activity[];
  GhiChu: Note[];
}

export interface CV {
  MaHoSoCV: string;
  DuongDanFile: string;
  KyNang: Skill[];
  KinhNghiem: Experience[];
  QuyTrinhUngTuyen: ApplicationProcess[];
}

export interface CandidateDetails {
  MaUngVien: string;
  HoTen: string;
  Email: string;
  SoDienThoai: string | null;
  HoSoCVs: CV[];
}