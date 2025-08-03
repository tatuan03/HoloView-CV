from __future__ import annotations
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

from app.schemas.department_schema import PhongBan


# ==================== VaiTro Schemas ====================
class VaiTroBase(BaseModel):
    MaVaiTro: str
    TenVaiTro: str
    MoTa: Optional[str] = None


class VaiTroCreate(VaiTroBase):
    pass


class VaiTro(VaiTroBase):
    class Config:
        from_attributes = True


# ==================== TaiKhoanNguoiDung Schemas ====================
class TaiKhoanNguoiDungBase(BaseModel):
    TenDangNhap: str
    HoTen: str
    Email: EmailStr
    MaVaiTro: str
    MaPhongBan: Optional[str] = None


class TaiKhoanNguoiDungCreate(TaiKhoanNguoiDungBase):
    MatKhau: str


class TaiKhoanNguoiDungUpdate(BaseModel):
    HoTen: Optional[str] = None
    Email: Optional[EmailStr] = None
    TrangThai: Optional[str] = None
    MaPhongBan: Optional[str] = None


# SỬA LẠI SCHEMA RESPONSE CHÍNH
class TaiKhoanNguoiDung(TaiKhoanNguoiDungBase):
    MaTaiKhoan: str
    TrangThai: str
    ThoiGianTao: datetime

    # Giữ lại các object lồng nhau để có thể dùng ở nơi khác nếu cần
    VaiTro: VaiTro
    PhongBan: Optional[PhongBan]

    class Config:
        from_attributes = True
