from pydantic import BaseModel
from typing import Optional


class ThongTinDuAn(BaseModel):
    TenDuAn: Optional[str] = None
    MoTa: Optional[str] = None
    CongNgheSuDung: Optional[str] = None

    class Config:
        orm_mode = True
