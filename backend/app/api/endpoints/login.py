# backend/app/api/endpoints/login.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status

# Bỏ import Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import token_schema  # Đảm bảo đã import
from app.crud import crud_user
from app.core import security
from app.core.config import settings

router = APIRouter()


@router.post("/token", response_model=token_schema.Token)  # Thêm lại response_model
def login_for_access_token(
    # Bỏ response: Response
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = crud_user.authenticate_user(
        db, username=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.TenDangNhap}, expires_delta=access_token_expires
    )

    # Trả về token trong JSON body
    return {"access_token": access_token, "token_type": "bearer"}
