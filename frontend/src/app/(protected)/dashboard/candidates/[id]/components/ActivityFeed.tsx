// src/app/(protected)/dashboard/candidates/[id]/components/ActivityFeed.tsx
'use client';

// --- Định nghĩa các kiểu dữ liệu ---
interface UserSimple {
  HoTen: string;
}
interface Activity {
  MaHoatDong: number;
  HanhDong: string;
  ThoiGian: string;
  NguoiThucHien: UserSimple | null;
}
interface Note {
  MaGhiChu: number;
  NoiDung: string;
  ThoiGianTao: string;
  NguoiTao: UserSimple | null;
}
interface ActivityFeedProps {
  activities: Activity[];
  notes: Note[];
}

// --- Component chính ---
export default function ActivityFeed({ activities, notes }: ActivityFeedProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Phần Ghi chú */}
      <div>
        <h3 className="font-semibold text-lg mb-4 text-black">Ghi chú & Đánh giá</h3>
        <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
          {notes && notes.length > 0 ? (
            notes.map(note => (
              <div key={note.MaGhiChu} className="text-sm p-2 bg-gray-50 rounded border">
                <p className="text-gray-800">{note.NoiDung}</p>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  - {note.NguoiTao?.HoTen || 'N/A'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-700">Chưa có ghi chú nào.</p>
          )}
        </div>
      </div>

      {/* Phần Lịch sử Hoạt động */}
      <div className="mt-6 border-t pt-4">
        <h3 className="font-semibold text-lg mb-4 text-black">Lịch sử hoạt động</h3>
        <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
          {activities && activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.MaHoatDong} className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center ring-4 ring-white">
                  <span className="text-indigo-600 text-xs font-bold">
                    {activity.NguoiThucHien?.HoTen.charAt(0) || 'H'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-800">
                    <span className="font-bold">{activity.NguoiThucHien?.HoTen || 'Hệ thống'}</span> {activity.HanhDong}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(activity.ThoiGian).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-700">Chưa có hoạt động nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}