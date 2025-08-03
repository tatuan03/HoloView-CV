# backend/app/schemas/activity_log_schema.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserSimple(BaseModel):
    HoTen: str

    class Config:
        orm_mode = True


class ActivityLog(BaseModel):
    HanhDong: str
    ThoiGian: datetime
    NguoiThucHien: Optional[UserSimple] = None

    class Config:
        orm_mode = True
