# backend/app/schemas/status_schema.py
from pydantic import BaseModel
from typing import Optional


class TrangThaiTuyenDungBase(BaseModel):
    MaTrangThai: str
    TenTrangThai: str
    MoTa: Optional[str] = None
    MauSac: Optional[str] = None


class TrangThaiTuyenDungCreate(TrangThaiTuyenDungBase):
    pass


class TrangThaiTuyenDungUpdate(BaseModel):
    TenTrangThai: Optional[str] = None
    MoTa: Optional[str] = None
    MauSac: Optional[str] = None


class TrangThaiTuyenDung(TrangThaiTuyenDungBase):
    class Config:
        orm_mode = True
