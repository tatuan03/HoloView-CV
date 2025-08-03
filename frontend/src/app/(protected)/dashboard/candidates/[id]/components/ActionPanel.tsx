// src/app/(protected)/dashboard/candidates/[id]/components/ActionPanel.tsx
"use client";
import { useEffect, useState, Fragment } from "react";
import Cookies from 'js-cookie';
// --- Định nghĩa các kiểu dữ liệu ---
interface Reviewer {
  MaTaiKhoan: string;
  HoTen: string;
}
interface Interview {
  MaLichPV: number;
  VongPhongVan: string;
  ThoiGian: string;
  KetQua: string | null;
  GhiChuCuaNguoiPhongVan: string | null;
}
interface Offer {
  MaOffer: number;
  NgayGuiOffer: string;
  PhanHoiUngVien: string;
}
interface ActionPanelProps {
  applicationId: string;
  currentStatus: string;
  interviews: Interview[];
  offers: Offer[];
  onActionSuccess: () => void;
}

interface User { MaTaiKhoan: string; HoTen: string; }


// --- Component chính ---
export default function ActionPanel({
  applicationId,
  currentStatus,
  interviews,
  offers,
  onActionSuccess,
}: ActionPanelProps) {
  // State cho Giao việc
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMessage, setAssignMessage] = useState("");

  // State cho Lên lịch Phỏng vấn
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewFormat, setInterviewFormat] = useState(
    "Online qua Google Meet"
  );
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]); 
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState("");

  // State cho Cập nhật kết quả phỏng vấn
  const [interviewResults, setInterviewResults] = useState<{
    [key: number]: { KetQua: string; GhiChu: string };
  }>({});
  const [updateLoading, setUpdateLoading] = useState<number | null>(null);

  // State cho Tạo Offer
  const [offerDate, setOfferDate] = useState("");
  const [salary, setSalary] = useState("");
  const [startDate, setStartDate] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerMessage, setOfferMessage] = useState("");

  //State để cập nhật Offer
  const [offerResponse, setOfferResponse] = useState('');
  const [responseDate, setResponseDate] = useState('');
  const [updateOfferLoading, setUpdateOfferLoading] = useState<number | null>(null);
  //State cho Final Status
  const [finalStatus, setFinalStatus] = useState('');
  const [finalStatusLoading, setFinalStatusLoading] = useState(false);
  const [finalStatusMessage, setFinalStatusMessage] = useState('');

  // State mới để quản lý chế độ chỉnh sửa
  const [editingInterviewId, setEditingInterviewId] = useState<number | null>(null);
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  //Logic theo vòng
  const lastInterview = interviews && interviews.length > 0 ? interviews[interviews.length - 1] : null;
  const canAssignReview = currentStatus === 'Mới';

  //Logic điều kiện
  const canScheduleInterview = (currentStatus.includes('Đã có kết quả ĐGKT: Dat') || (lastInterview && lastInterview.KetQua === 'Dat')) && interviews.length < 3;
  const canCreateOffer = interviews.length >= 3 && currentStatus.includes('Đạt');
  const isFinalStage = currentStatus.includes('ChapNhan') || currentStatus.includes('TuChoi') || currentStatus.includes('ThuongLuong');

  useEffect(() => {
    async function fetchReviewers() {
      try {
        const res = await fetch(
          "http://localhost:8000/api/v1/users/reviewers/"
        );
        if (!res.ok) throw new Error("Failed to fetch reviewers");
        const data = await res.json();
        setReviewers(data);
        if (data.length > 0) {
          setSelectedReviewer(data[0].MaTaiKhoan);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchReviewers();
  }, []);


  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = Cookies.get('access_token');
        const res = await fetch('http://localhost:8000/api/v1/users/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setAllUsers(data);
        const reviewers = data.filter((u: any) => u.MaVaiTro === 'REVIEWER');
        if (reviewers.length > 0) {
          setSelectedReviewer(reviewers[0].MaTaiKhoan);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchUsers();
  }, []);

  const hienThiPhanHoi = (phanHoi: string) => {
  switch (phanHoi) {
    case 'ChapNhan':
      return 'Chấp nhận offer';
    case 'TuChoi':
      return 'Từ chối offer';
    case 'ThuongLuong':
      return 'Thương lượng';
    default:
      return phanHoi;
  }
};

  const handleAssignReview = async () => {
    const token = Cookies.get('access_token');
    if (!selectedReviewer) {
      alert("Vui lòng chọn một người để review.");
      return;
    }
    setAssignLoading(true);
    setAssignMessage("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/technical-reviews/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json",'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            MaQuyTrinh: applicationId,
            MaNguoiDanhGia: selectedReviewer,
            KetQua: "CanXemXetThem",
            NhanXet: "HR đã giao việc review.",
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Giao việc thất bại");
      }

      setAssignMessage("Giao việc review thành công!");
      onActionSuccess();
    } catch (error: any) {
      setAssignMessage(`Lỗi: ${error.message}`);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!interviewDate || !interviewTime) {
      alert("Vui lòng điền ngày và giờ phỏng vấn.");
      return;
    }
    setScheduleLoading(true);
    setScheduleMessage('');
    const token = Cookies.get('access_token');
    try {
      const dateTime = `${interviewDate}T${interviewTime}:00`;
      const response = await fetch("http://localhost:8000/api/v1/interviews/", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          MaQuyTrinh: applicationId,
          VongPhongVan: `Vòng ${interviews.length + 1}`,
          ThoiGian: dateTime,
          HinhThuc: interviewFormat,
          MaNguoiPhongVan: selectedInterviewers, // Gửi đi danh sách ID
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Lên lịch thất bại");
      }
      setScheduleMessage("Lên lịch phỏng vấn thành công!");
      onActionSuccess();
    } catch (error: any) {
      setScheduleMessage(`Lỗi: ${error.message}`);
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleUpdateInterviewResult = async (interviewId: number) => {
    const result = interviewResults[interviewId];
    const token = Cookies.get('access_token');
    if (!result || !result.KetQua) {
      alert("Vui lòng chọn kết quả phỏng vấn.");
      return;
    }
    setUpdateLoading(interviewId);
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/interviews/${interviewId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json",
              'Authorization': `Bearer ${token}`
           },
          body: JSON.stringify({
            KetQua: result.KetQua,
            GhiChuCuaNguoiPhongVan: result.GhiChu,
          }),
        }
      );
      if (!response.ok) throw new Error("Cập nhật thất bại");
      alert("Cập nhật kết quả thành công!");
      onActionSuccess();
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setUpdateLoading(null);
    }
    setEditingInterviewId(null);
  };

  const handleInterviewerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const value: string[] = [];
    for (let i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
            value.push(options[i].value);
        }
    }
    setSelectedInterviewers(value);
  }

  const handleInterviewResultChange = (
    id: number,
    field: "KetQua" | "GhiChu",
    value: string
  ) => {
    setInterviewResults((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { KetQua: "", GhiChu: "" }), [field]: value },
    }));
  };

  const handleCreateOffer = async () => {
    if (!offerDate) {
        alert("Vui lòng chọn ngày gửi offer.");
        return;
    }
    setOfferLoading(true);
    setOfferMessage('');

    // Lấy token từ cookie
    const token = Cookies.get('access_token');

    try {
        const response = await fetch('http://localhost:8000/api/v1/offers/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                MaQuyTrinh: applicationId,
                NgayGuiOffer: offerDate,
                LuongDeXuat: salary ? parseFloat(salary) : null,
                NgayBatDauDuKien: startDate || null
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Tạo offer thất bại");
        }

        setOfferMessage("Tạo offer thành công!");
        onActionSuccess();
    } catch (error: any) {
        setOfferMessage(`Lỗi: ${error.message}`);
    } finally {
        setOfferLoading(false);
    }
  };

  const handleUpdateOffer = async (offerId: number) => {
    if (!offerResponse || !responseDate) {
      alert("Vui lòng chọn phản hồi và ngày phản hồi.");
      return;
    }
    setUpdateOfferLoading(offerId);
    const token = Cookies.get('access_token');
    try {
      const response = await fetch(`http://localhost:8000/api/v1/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ PhanHoiUngVien: offerResponse, NgayPhanHoi: responseDate })
      });
      if (!response.ok) throw new Error("Cập nhật offer thất bại");
      alert("Cập nhật phản hồi offer thành công!");
      onActionSuccess();
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setUpdateOfferLoading(null);
    }
    setEditingOfferId(null);
  };

  // Hàm để điền dữ liệu cũ vào form khi nhấn Sửa
  const startEditingInterview = (interview: Interview) => {
    setEditingInterviewId(interview.MaLichPV);
    setInterviewResults(prev => ({
        ...prev,
        [interview.MaLichPV]: {
            KetQua: interview.KetQua || '',
            GhiChu: interview.GhiChuCuaNguoiPhongVan || ''
        }
    }));
  };

  const handleUpdateFinalStatus = async () => {
    if (!finalStatus) {
        alert("Vui lòng chọn trạng thái cuối cùng.");
        return;
    }
    setFinalStatusLoading(true);
    setFinalStatusMessage('');
    const token = Cookies.get('access_token');
    try {
        const response = await fetch(`http://localhost:8000/api/v1/applications/${applicationId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ TrangThaiHienTai: finalStatus })
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Cập nhật trạng thái thất bại");
        }
        setFinalStatusMessage("Cập nhật trạng thái thành công!");
        onActionSuccess();
    } catch (error: any) {
        setFinalStatusMessage(`Lỗi: ${error.message}`);
    } finally {
        setFinalStatusLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div>
        <h3 className="font-semibold text-lg text-black">Trạng thái hiện tại</h3>
        <p className="text-sm text-indigo-600 font-medium mt-1 py-1 px-2 bg-indigo-50 rounded-md inline-block">
          {currentStatus}
        </p>
      </div>

       {/* --- PHẦN PHỎNG VẤN (ĐÃ NÂNG CẤP) --- */}
      {interviews && interviews.length > 0 && (
        <div className="border-t pt-4">
            <h3 className="font-semibold text-lg text-black">Các vòng Phỏng vấn</h3>
            <div className="mt-2 space-y-4">
                {interviews.map((iv) => (
                    <div key={iv.MaLichPV} className="p-3 bg-gray-50 rounded-md border">
                        {/* Kiểm tra xem có đang ở chế độ sửa cho phỏng vấn này không */}
                        {editingInterviewId === iv.MaLichPV ? (
                            // GIAO DIỆN SỬA
                            <div className="mt-3 space-y-2">
                                <p className="font-medium text-gray-800 mb-2">Đang sửa: {iv.VongPhongVan}</p>
                                <select onChange={(e) => handleInterviewResultChange(iv.MaLichPV, 'KetQua', e.target.value)} className="w-full input-style text-sm text-black">
                                     <option value="">-- Chọn kết quả --</option>
                                     <option value="Dat">Đạt</option>
                                     <option value="KhongDat">Không Đạt</option>
                                 </select>
                                <textarea 
                                    value={interviewResults[iv.MaLichPV]?.GhiChu || ''}
                                    onChange={(e) => handleInterviewResultChange(iv.MaLichPV, 'GhiChu', e.target.value)} 
                                    className="w-full input-style text-sm text-gray-800" />
                                <div className="flex gap-2">
                                    <button onClick={() => handleUpdateInterviewResult(iv.MaLichPV)} disabled={updateLoading === iv.MaLichPV} className="w-full btn-primary text-xs text-green-600">Lưu</button>
                                    <button onClick={() => setEditingInterviewId(null)} className="w-full btn-secondary text-xs text-red-600">Hủy</button>
                                </div>
                            </div>
                        ) : (
                            // GIAO DIỆN XEM
                            <div>
                                <div className="flex justify-between items-center">
                                    <p className="font-medium text-gray-800">{iv.VongPhongVan}</p>
                                    <button onClick={() => startEditingInterview(iv)} className="text-xs text-indigo-600 hover:underline">Sửa</button>
                                </div>
                                <p className="text-xs text-gray-500">{new Date(iv.ThoiGian).toLocaleString("vi-VN")}</p>
                                <p className="text-sm mt-2 text-gray-800">Kết quả: <span className={`font-bold ${iv.KetQua === 'Dat' ? 'text-green-600' : 'text-red-600'}`}>{iv.KetQua || 'Chưa có'}</span></p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      )}

      {offers && offers.length > 0 && (
        <div className="border-t pt-4">
            <h3 className="font-semibold text-lg text-black">Lịch sử Offer</h3>
            {offers.map(offer => (
              <div key={offer.MaOffer} className="p-2 bg-gray-100 rounded-md mt-2 border border-gray-300 text-sm rounded-">
                <p className="text-gray-800">Gửi ngày: {new Date(offer.NgayGuiOffer).toLocaleDateString('vi-VN')}</p>
                <p className="text-gray-800">Phản hồi: <span className="font-bold">{hienThiPhanHoi(offer.PhanHoiUngVien)}</span></p>
              </div>
            ))}
        </div>
      )}

      {!isFinalStage && (
      <>
      {(currentStatus === 'Mới' || currentStatus.includes('Đã sàng lọc')) && (
        <div className="border-t pt-4">
          <h3 className="font-semibold text-lg text-black">Giao việc Đánh giá KT</h3>
          <div className="mt-2 space-y-3">
            <label htmlFor="reviewer" className="block text-sm font-medium text-gray-800">Chọn người đánh giá</label>
            <select
              id="reviewer" value={selectedReviewer} onChange={(e) => setSelectedReviewer(e.target.value)}
              className="input-style w-full text-black "
            >
              {reviewers.map(r => (<option key={r.MaTaiKhoan} value={r.MaTaiKhoan}>{r.HoTen}</option>))}
            </select>
            <button
              onClick={handleAssignReview} disabled={!selectedReviewer}
              className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-green-800 hover:bg-green-900 disabled:bg-green-400"
            >
              Xác nhận Giao việc
            </button>
          </div>
          {assignMessage && <p className="text-sm text-center text-gray-600 mt-2">{assignMessage}</p>}
        </div>
      )}

      {canScheduleInterview && (
      <div className="border-t pt-4">
        <h3 className="font-semibold text-lg text-black">Lên lịch Phỏng vấn mới</h3>
        <div className="mt-2 space-y-3">
          <div>
            <label htmlFor="interviewDate" className="block text-sm font-medium text-gray-700">Ngày</label>
            <input type="date" id="interviewDate" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="input-style text-gray-800" />
          </div>
          <div>
            <label htmlFor="interviewTime" className="block text-sm font-medium text-gray-700">Giờ</label>
            <input type="time" id="interviewTime" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} className="input-style text-gray-800" />
          </div>
          <div>
            <label htmlFor="interviewFormat" className="block text-sm font-medium text-gray-700">Hình thức</label>
            <input type="text" id="interviewFormat" value={interviewFormat} onChange={e => setInterviewFormat(e.target.value)} className="input-style text-gray-800" />
          </div>
           <div>
            <label htmlFor="interviewers" className="block text-sm font-medium text-gray-700">Chọn người phỏng vấn (giữ Ctrl để chọn nhiều)</label>
            <select
                id="interviewers"
                multiple={true} // Cho phép chọn nhiều
                value={selectedInterviewers}
                onChange={handleInterviewerChange}
                className="input-style w-full h-24 text-gray-800" 
            >
                {allUsers.map(user => (
                    <option key={user.MaTaiKhoan} value={user.MaTaiKhoan}>{user.HoTen}</option>
                ))}
            </select>
          </div>
          <button
            onClick={handleScheduleInterview}
            disabled={scheduleLoading}
            className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            {scheduleLoading ? "Đang xử lý..." : "Xác nhận Lên lịch"}
          </button>
        </div>
        {scheduleMessage && <p className="text-sm text-center text-gray-600 mt-2">{scheduleMessage}</p>}
      </div>
      )}

      {/* --- PHẦN OFFER (ĐÃ NÂNG CẤP) --- */}
      {offers && offers.length > 0 && (
        <div className="border-t pt-4">
            <h3 className="font-semibold text-lg text-black">Đề xuất Tuyển dụng</h3>
            {offers.map(offer => (
              <div key={offer.MaOffer} className="p-3 bg-gray-50 rounded-md mt-2 border">
                {editingOfferId === offer.MaOffer ? (
                    // GIAO DIỆN SỬA
                    <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium mb-2 text-black">Đang sửa phản hồi</p>
                        <select onChange={e => setOfferResponse(e.target.value)} className="input-style w-full text-sm text-gray-800">
                          <option value="">-- Chọn phản hồi --</option>
                          <option value="ChapNhan">Chấp nhận</option>
                          <option value="TuChoi">Từ chối</option>
                          <option value="ThuongLuong">Thương lượng</option>
                        </select>
                        <input type="date" value={responseDate} onChange={e => setResponseDate(e.target.value)} className="input-style w-full text-sm text-gray-800" />
                        <div className="flex gap-2">
                            <button onClick={() => handleUpdateOffer(offer.MaOffer)} className="w-full btn-primary text-xs text-green-600 font-bold">Lưu</button>
                            <button onClick={() => setEditingOfferId(null)} className="w-full btn-secondary text-xs text-red-600 font-bold">Hủy</button>
                        </div>
                    </div>
                ) : (
                    // GIAO DIỆN XEM
                    <div className="flex justify-between items-center">
                        <div>
                           <p className="text-sm font-medium text-gray-800">Gửi ngày: {new Date(offer.NgayGuiOffer).toLocaleDateString('vi-VN')}</p>
                           <p className="text-sm mt-1 text-gray-800">Phản hồi: <span className="font-bold">{hienThiPhanHoi(offer.PhanHoiUngVien)}</span></p>
                        </div>
                        <button onClick={() => setEditingOfferId(offer.MaOffer)} className="text-xs text-indigo-600 hover:underline">Sửa</button>
                    </div>
                )}
              </div>
            ))}
        </div>
      )}

      {canCreateOffer && (
      <div className="border-t pt-4">
        <h3 className="font-semibold text-lg text-black">
          Tạo Đề xuất Tuyển dụng (Offer)
        </h3>
        <div className="mt-2 space-y-3">
          <div>
            <label
              htmlFor="offerDate"
              className="block text-sm font-medium text-gray-700"
            >
              Ngày gửi Offer
            </label>
            <input
              type="date"
              id="offerDate"
              value={offerDate}
              onChange={(e) => setOfferDate(e.target.value)}
              className="input-style text-gray-700"
            />
          </div>
          <div>
            <label
              htmlFor="salary"
              className="block text-sm font-medium text-gray-700"
            >
              Lương đề xuất (VND)
            </label>
            <input
              type="number"
              id="salary"
              placeholder="VD: 20000000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="input-style text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Ngày bắt đầu dự kiến
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-style text-gray-700"
            />
          </div>
          <button
            onClick={handleCreateOffer}
            disabled={offerLoading}
            className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
          >
            {offerLoading ? "Đang xử lý..." : "Tạo Offer"}
          </button>
        </div>
        {offerMessage && (
          <p className="text-sm text-center text-gray-600 mt-2">
            {offerMessage}
          </p>
        )}
      </div>
      )}
      </>
      )}

      {isFinalStage && (
        <div className="border-t pt-4">
          <h3 className="font-semibold text-lg text-black">Quyết định Tuyển dụng Cuối cùng</h3>
          <div className="mt-2 space-y-3">
            <label htmlFor="finalStatus" className="block text-sm font-medium text-gray-700">Cập nhật trạng thái</label>
            <select 
              id="finalStatus" 
              onChange={e => setFinalStatus(e.target.value)} 
              className="input-style w-full text-gray-800"
            >
              <option value="">-- Chọn trạng thái --</option>
              <option value="Chính thức được tuyển dụng">Chính thức được tuyển dụng</option>
              <option value="Không tiếp tục hợp tác">Không tiếp tục hợp tác</option>
            </select>
            <button
              onClick={handleUpdateFinalStatus}
              disabled={finalStatusLoading}
              className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-950 disabled:bg-gray-400"
            >
              {finalStatusLoading ? "Đang lưu..." : "Lưu quyết định"}
            </button>
          </div>
          {finalStatusMessage && <p className="text-sm text-center text-gray-600 mt-2">{finalStatusMessage}</p>}
        </div>
      )}
    </div>
  );
}
