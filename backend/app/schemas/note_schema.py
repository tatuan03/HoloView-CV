# backend/app/schemas/note_schema.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NoteBase(BaseModel):
    NoiDung: str


class NoteCreate(NoteBase):
    MaQuyTrinh: str


class Note(NoteBase):
    MaGhiChu: int
    MaNguoiTao: str
    ThoiGianTao: datetime

    class Config:
        orm_mode = True
