from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from app.schemas import recruitment_schema, project_schema


# ==================== ThongTinKyNang Schemas ====================
class ThongTinKyNangBase(BaseModel):
    TenKyNang: str
    LoaiKyNang: Optional[str] = None
    TrinhDo: Optional[str] = None


class ThongTinKyNangCreate(ThongTinKyNangBase):
    pass


class ThongTinKyNang(ThongTinKyNangBase):
    MaKyNang: int
    MaHoSoCV: str

    class Config:
        orm_mode = True


# ==================== ThongTinKinhNghiem Schemas ====================
class ThongTinKinhNghiemBase(BaseModel):
    TenCongTy: Optional[str] = None
    ViTri: Optional[str] = None
    ThoiGianBatDau: Optional[date] = None
    ThoiGianKetThuc: Optional[date] = None
    MoTaCongViec: Optional[str] = None


class ThongTinKinhNghiemCreate(ThongTinKinhNghiemBase):
    pass


class ThongTinKinhNghiem(ThongTinKinhNghiemBase):
    MaKinhNghiem: int
    MaHoSoCV: str

    class Config:
        orm_mode = True


# ==================== ThongTinHocVan Schemas ====================
class ThongTinHocVanBase(BaseModel):
    TenTruong: Optional[str] = None
    ChuyenNganh: Optional[str] = None
    BangCap: Optional[str] = None
    NamTotNghiep: Optional[int] = None


class ThongTinHocVanCreate(ThongTinHocVanBase):
    pass


class ThongTinHocVan(ThongTinHocVanBase):
    MaHocVan: int
    MaHoSoCV: str

    class Config:
        orm_mode = True


# ==================== HoSoCV Schemas ====================
class HoSoCVBase(BaseModel):
    MaUngVien: str
    DuongDanFile: str


class HoSoCV(HoSoCVBase):
    MaHoSoCV: str
    NgayTaiLen: datetime
    TrangThaiXuLyOCR: str
    HocVan: List[ThongTinHocVan] = []
    KinhNghiem: List[ThongTinKinhNghiem] = []
    KyNang: List[ThongTinKyNang] = []
    QuyTrinhUngTuyen: List[recruitment_schema.QuyTrinhUngTuyen] = []
    DuAn: List[project_schema.ThongTinDuAn] = []

    class Config:
        orm_mode = True


# ==================== UngVien Schemas ====================
class UngVienBase(BaseModel):
    HoTen: str
    Email: str
    SoDienThoai: Optional[str] = None
    DiaChi: Optional[str] = None
    NgaySinh: Optional[date] = None


class UngVienCreate(UngVienBase):
    pass


class UngVien(UngVienBase):
    MaUngVien: str
    ThoiGianTao: datetime
    HoSoCVs: List[HoSoCV] = []

    class Config:
        orm_mode = True


class UngVienUpdate(BaseModel):
    HoTen: Optional[str] = None
    Email: Optional[EmailStr] = None  # <-- pydantic sẽ validate đây là email hợp lệ
    SoDienThoai: Optional[str] = None
    DiaChi: Optional[str] = None
    NgaySinh: Optional[date] = None
