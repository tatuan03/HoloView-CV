from fastapi import FastAPI
from app.api.api_router import api_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="CV Management System API",
    description="API for the CV Management System project.",
    version="1.0.0",
)

# --- CẤU HÌNH CORS ---
origins = [
    "http://localhost:3000",  # Địa chỉ của Frontend Next.js
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các method
    allow_headers=["*"],  # Cho phép tất cả các header
)
# -----------------------
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {"message": "Welcome to the CV Management System API"}
