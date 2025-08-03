# app/api/endpoints/interviews.py
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import HTMLResponse
from app.db.database import get_db
from app.schemas import recruitment_schema, user_schema
from app.crud import crud_recruitment
from app.core.auth import get_current_user

router = APIRouter()


@router.post(
    "/",
    response_model=recruitment_schema.LichPhongVan,
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "/",
    response_model=recruitment_schema.LichPhongVan,
    status_code=status.HTTP_201_CREATED,
)
async def schedule_interview(
    interview_in: recruitment_schema.LichPhongVanCreate,
    db: Session = Depends(get_db),
    current_user: user_schema.TaiKhoanNguoiDung = Depends(get_current_user),
):
    result = await crud_recruitment.create_interview_schedule(
        db=db, interview_in=interview_in, current_user_id=current_user.MaTaiKhoan
    )

    if isinstance(result, str):
        if result == "PAST_DATE_ERROR":
            raise HTTPException(
                status_code=400,
                detail="Không thể lên lịch phỏng vấn vào một ngày trong quá khứ.",
            )
        if result.startswith("LOGIC_ERROR"):
            raise HTTPException(status_code=400, detail=result.split(": ")[1])
        if result == "APP_NOT_FOUND":
            raise HTTPException(
                status_code=404, detail="Không tìm thấy quy trình ứng tuyển."
            )

    return result


@router.patch("/{interview_id}", response_model=recruitment_schema.LichPhongVan)
def update_interview(
    interview_id: int,
    interview_update: recruitment_schema.LichPhongVanUpdate,
    db: Session = Depends(get_db),
    current_user: user_schema.TaiKhoanNguoiDung = Depends(get_current_user),
):
    """
    API để cập nhật kết quả cho một buổi phỏng vấn.
    """
    # (Tương tự, chúng ta cũng nên cập nhật hàm CRUD `update_interview_result`
    # để nó nhận current_user_id và ghi log)
    updated_interview = crud_recruitment.update_interview_result(
        db=db, interview_id=interview_id, interview_update=interview_update
    )
    if updated_interview is None:
        raise HTTPException(status_code=404, detail="Interview not found")
    return updated_interview


@router.get("/confirm/{token}", response_class=HTMLResponse)
def confirm_interview(token: str, db: Session = Depends(get_db)):
    """
    API để ứng viên xác nhận lịch phỏng vấn qua link trong email.
    """
    interview = crud_recruitment.confirm_interview_by_token(db, token=token)

    if not interview:
        return HTMLResponse(
            content="<h1>Link không hợp lệ hoặc đã hết hạn.</h1><p>Vui lòng liên hệ lại với bộ phận tuyển dụng.</p>",
            status_code=400,
        )

    # Trả về một trang HTML thông báo thành công
    return HTMLResponse(
        content=f"""
    <html>
        <head>
            <title>Xác nhận thành công</title>
            <style>
                body {{ font-family: sans-serif; text-align: center; padding-top: 50px; }}
                .container {{ max-width: 600px; margin: auto; border: 1px solid #ccc; padding: 20px; border-radius: 8px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Xác nhận thành công!</h1>
                <p>Cảm ơn bạn đã xác nhận tham gia buổi phỏng vấn.</p>
                <p>Chúng tôi rất mong được gặp bạn vào lúc <strong>{interview.ThoiGian.strftime('%H:%M ngày %d/%m/%Y')}</strong>.</p>
                <p>Trân trọng,<br>Công ty TechBee</p>
            </div>
        </body>
    </html>
    """
    )
