# backend/app/api/endpoints/activities.py
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.crud import crud_activity_log
from app.schemas.activity_log_schema import ActivityLog
from app.core.auth import get_current_user

router = APIRouter()


@router.get(
    "/recent",
    response_model=List[ActivityLog],
    dependencies=[Depends(get_current_user)],
)
def read_recent_activities(db: Session = Depends(get_db)):
    return crud_activity_log.get_recent_activities(db)
