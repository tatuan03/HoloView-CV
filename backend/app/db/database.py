from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Tạo engine kết nối tới CSDL sử dụng chuỗi kết nối từ file config
engine = create_engine(settings.DATABASE_URL)

# Tạo một phiên (Session) cục bộ. Mỗi instance của SessionLocal sẽ là một phiên CSDL.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class cho các lớp model. Các model sẽ kế thừa từ lớp này.
Base = declarative_base()


# Dependency để cung cấp một phiên CSDL cho mỗi request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()