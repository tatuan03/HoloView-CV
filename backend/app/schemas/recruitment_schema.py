from __future__ import annotations
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

# Import schema phòng ban
from .department_schema import PhongBan


# ==================== ViTriTuyenDung Schemas ====================
class ViTriTuyenDungBase(BaseModel):
    MaViTri: str
    TenViTri: str
    MaPhongBan: str  # Bắt buộc phải có khi tạo
    MoTa: Optional[str] = None
    YeuCau: Optional[str] = None
    SoLuong: int = 1


class ViTriTuyenDungCreate(ViTriTuyenDungBase):
    NgayDang: date
    NgayHetHan: Optional[date] = None


class ViTriTuyenDungUpdate(BaseModel):
    TenViTri: Optional[str] = None
    MoTa: Optional[str] = None
    YeuCau: Optional[str] = None
    SoLuong: Optional[int] = None
    NgayHetHan: Optional[date] = None
    TrangThai: Optional[str] = None


class ViTriTuyenDung(ViTriTuyenDungBase):
    NgayDang: date
    NgayHetHan: Optional[date] = None
    TrangThai: str
    PhongBan: PhongBan  # <-- CẬP NHẬT: Thêm object PhongBan vào response

    class Config:
        orm_mode = True


# ==================== QuyTrinhUngTuyen Schemas ====================
# Schema cho việc tạo một quy trình ứng tuyển mới
class QuyTrinhUngTuyenCreate(BaseModel):
    MaHoSoCV: str
    MaViTri: str


# Schema để cập nhật trạng thái
class QuyTrinhUngTuyenUpdateStatus(BaseModel):
    TrangThaiHienTai: str


# Schema đầy đủ để trả về
class QuyTrinhUngTuyen(QuyTrinhUngTuyenCreate):
    MaQuyTrinh: str
    NgayUngTuyen: datetime
    TrangThaiHienTai: str
    LichPhongVan: Optional[list[LichPhongVan]]
    LichSuHoatDong: Optional[list[LichSuHoatDong]]
    DeXuatTuyenDung: Optional[list[DeXuatTuyenDung]]
    HoSoCV: Optional[HoSoCVSimple] = None
    ViTriTuyenDung: Optional[ViTriTuyenDungSimple] = None

    class Config:
        orm_mode = True


# ==================== DanhGiaKyThuat Schemas ====================
class DanhGiaKyThuatBase(BaseModel):
    MaQuyTrinh: str
    MaNguoiDanhGia: (
        str  # Tạm thời chúng ta sẽ truyền tay, sau này sẽ lấy từ user đăng nhập
    )
    KetQua: str  # Phải là một trong các giá trị 'Dat', 'KhongDat', 'CanXemXetThem'
    NhanXet: Optional[str] = None


class DanhGiaKyThuatCreate(DanhGiaKyThuatBase):
    pass


class DanhGiaKyThuat(DanhGiaKyThuatBase):
    MaDanhGia: int
    NgayDanhGia: datetime

    class Config:
        orm_mode = True


class DanhGiaKyThuatUpdate(BaseModel):
    KetQua: str  # 'Dat', 'KhongDat', 'CanXemXetThem'
    NhanXet: Optional[str] = None


# ==================== BaiKiemTra Schemas ====================
class BaiKiemTraBase(BaseModel):
    MaQuyTrinh: str
    TenBaiKiemTra: Optional[str] = None
    NgayGiao: Optional[datetime] = None
    HanNop: Optional[datetime] = None


class BaiKiemTraCreate(BaiKiemTraBase):
    pass


class BaiKiemTra(BaiKiemTraBase):
    MaBaiKiemTra: int
    DiemSo: Optional[float] = None
    KetQua: Optional[str] = None
    DuongDanBaiLam: Optional[str] = None

    class Config:
        orm_mode = True


class BaiKiemTraUpdate(BaseModel):
    DiemSo: Optional[float] = None
    KetQua: Optional[str] = None  # 'Dat' hoặc 'KhongDat'
    DuongDanBaiLam: Optional[str] = None


# ==================== LichPhongVan Schemas ====================
class LichPhongVanBase(BaseModel):
    MaQuyTrinh: str
    VongPhongVan: str
    ThoiGian: datetime
    HinhThuc: str
    GhiChuCuaNguoiPhongVan: Optional[str] = None
    KetQua: Optional[str] = None


class LichPhongVanCreate(LichPhongVanBase):
    # Nhận vào một danh sách các ID của người phỏng vấn
    MaNguoiPhongVan: list[str] = []


class LichPhongVan(LichPhongVanBase):
    MaLichPV: int
    VongPhongVan: str
    ThoiGian: datetime
    KetQua: Optional[str] = None
    GhiChuCuaNguoiPhongVan: Optional[str] = None

    class Config:
        orm_mode = True


class LichPhongVanUpdate(BaseModel):
    KetQua: Optional[str] = None
    GhiChuCuaNguoiPhongVan: Optional[str] = None


# ==================== DeXuatTuyenDung Schemas ====================
class DeXuatTuyenDungBase(BaseModel):
    MaQuyTrinh: str
    NgayGuiOffer: date
    LuongDeXuat: Optional[float] = None
    NgayBatDauDuKien: Optional[date] = None


class DeXuatTuyenDungCreate(DeXuatTuyenDungBase):
    pass


class DeXuatTuyenDung(DeXuatTuyenDungBase):
    MaOffer: int
    PhanHoiUngVien: str  # Mặc định là 'ChuaPhanHoi'
    NgayPhanHoi: Optional[date] = None

    class Config:
        orm_mode = True


class DeXuatTuyenDungUpdate(BaseModel):
    PhanHoiUngVien: str  # 'ChapNhan', 'TuChoi', 'ThuongLuong'
    NgayPhanHoi: date


# --- Schema lấy UngVien ---
class UngVienDonGian(BaseModel):
    MaUngVien: str
    HoTen: str

    class Config:
        orm_mode = True


class CVFilePath(BaseModel):
    DuongDanFile: str

    class Config:
        orm_mode = True


# --- Schema cho trang "My Reviews" ---
class AssignedReview(BaseModel):
    MaDanhGia: int
    MaQuyTrinh: str
    TrangThaiHienTai: str
    UngVien: UngVienDonGian  # Thông tin ứng viên

    class Config:
        orm_mode = True


# --- Schema cho trang chi tiết Review ---
class ReviewDetails(BaseModel):
    MaDanhGia: int
    UngVien: UngVienDonGian
    HoSoCV: CVFilePath

    class Config:
        orm_mode = True


# ==================== LichSuHoatDong Schemas ====================
class LichSuHoatDong(BaseModel):
    MaNguoiThucHien: Optional[str] = None
    HanhDong: str
    ThoiGian: datetime
    # Có thể thêm HoTen của người thực hiện ở đây nếu cần

    class Config:
        orm_mode = True


# --- Schemas con cho chi tiết CV ---
class ThongTinKyNang(BaseModel):
    TenKyNang: str

    class Config:
        orm_mode = True


class ThongTinKinhNghiem(BaseModel):
    TenCongTy: Optional[str] = None
    ViTri: Optional[str] = None

    class Config:
        orm_mode = True


class ThongTinDuAn(BaseModel):
    TenDuAn: Optional[str] = None
    MoTa: Optional[str] = None
    CongNgheSuDung: Optional[str] = None

    class Config:
        orm_mode = True


# --- Schema CV chi tiết cho trang Review ---
class CVDetailsForReview(BaseModel):
    DuongDanFile: str
    KyNang: list[ThongTinKyNang] = []
    KinhNghiem: list[ThongTinKinhNghiem] = []
    DuAn: list[ThongTinDuAn] = []

    class Config:
        orm_mode = True


# --- Schema chính cho trang Review ---
class ReviewDetails(BaseModel):
    MaDanhGia: int
    UngVien: "UngVienDonGian"
    HoSoCV: CVDetailsForReview
    KetQua: str
    NhanXet: Optional[str] = None

    class Config:
        orm_mode = True


# --- Schemas con để lồng vào ---
class UngVienDonGian(BaseModel):
    HoTen: str

    class Config:
        orm_mode = True


class HoSoCVSimple(BaseModel):
    UngVien: UngVienDonGian

    class Config:
        orm_mode = True


class ViTriTuyenDungSimple(BaseModel):
    TenViTri: str

    class Config:
        orm_mode = True
