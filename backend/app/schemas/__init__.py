from .department_schema import PhongBan, PhongBanCreate
from .user_schema import (
    VaiTro,
    TaiKhoanNguoiDung,
    TaiKhoanNguoiDungCreate,
    TaiKhoanNguoiDungUpdate,
)
from .cv_schema import (
    UngVien,
    UngVienCreate,
    UngVienUpdate,
    HoSoCV,
    ThongTinHocVan,
    ThongTinKinhNghiem,
    ThongTinKyNang,
)
from .recruitment_schema import (
    ViTriTuyenDung,
    ViTriTuyenDungCreate,
    ViTriTuyenDungUpdate,
    QuyTrinhUngTuyen,
    QuyTrinhUngTuyenCreate,
    QuyTrinhUngTuyenUpdateStatus,
    DanhGiaKyThuat,
    DanhGiaKyThuatCreate,
    DanhGiaKyThuatUpdate,
    BaiKiemTraUpdate,
    DeXuatTuyenDung,
    DeXuatTuyenDungCreate,
    DeXuatTuyenDungUpdate,
    LichPhongVanUpdate,
    AssignedReview,
    LichSuHoatDong,
)
from .token_schema import Token, TokenData
from .status_schema import (
    TrangThaiTuyenDung,
    TrangThaiTuyenDungCreate,
    TrangThaiTuyenDungUpdate,
)
