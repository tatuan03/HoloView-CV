from pydantic import BaseModel
from typing import Optional


class PhongBanBase(BaseModel):
    MaPhongBan: str
    TenPhongBan: str
    MoTa: Optional[str] = None


class PhongBanCreate(PhongBanBase):
    pass


class PhongBan(PhongBanBase):
    class Config:
        from_attributes = True


PhongBan.model_rebuild()
