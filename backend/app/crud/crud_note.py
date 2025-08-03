# backend/app/crud/crud_note.py
from sqlalchemy.orm import Session
from app.models.recruitment import GhiChu
from app.schemas.note_schema import NoteCreate


def create_note_for_application(db: Session, note: NoteCreate, user_id: str):
    db_note = GhiChu(
        NoiDung=note.NoiDung, MaQuyTrinh=note.MaQuyTrinh, MaNguoiTao=user_id
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note
