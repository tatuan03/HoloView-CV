# backend/app/core/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.config import settings
from app.db.database import get_db
from app.crud import crud_user
from app.schemas import token_schema, user_schema
from app.models import user as user_model


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login/token")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = token_schema.TokenData(username=username)
    except JWTError:
        raise credentials_exception

    # Sửa lại để dùng hàm get_user_by_username
    user = crud_user.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


def role_checker(allowed_roles: list):
    def checker(current_user: user_model.TaiKhoanNguoiDung = Depends(get_current_user)):
        if current_user.MaVaiTro not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for your role",
            )
        return current_user

    return checker
