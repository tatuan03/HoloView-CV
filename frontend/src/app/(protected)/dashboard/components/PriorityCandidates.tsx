// src/app/(protected)/dashboard/components/PriorityCandidates.tsx
import Link from 'next/link';
import { cookies } from 'next/headers';

// --- Định nghĩa các kiểu dữ liệu cho đúng với API response mới ---
interface PriorityApplication {
  MaQuyTrinh: string;
  TrangThaiHienTai: string;
  HoSoCV?: {
    UngVien?: {
      HoTen: string;
    }
  }
  ViTriTuyenDung?: {
    TenViTri: string;
  }
}

async function getPriorityCandidates(): Promise<PriorityApplication[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  try {
    const res = await fetch('http://localhost:8000/api/v1/applications/priority', {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    return [];
  }
}

export default async function PriorityCandidates() {
  const applications = await getPriorityCandidates();

  return (
    <div className="bg-white p-6 rounded-lg shadow h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-black">Ứng viên cần chú ý</h3>
        <Link href="/dashboard/candidates" className="text-sm text-indigo-600 hover:underline">
          Xem tất cả
        </Link>
      </div>
      <div className="space-y-4">
        {applications.length > 0 ? (
          applications.map((app) => (
            <div key={app.MaQuyTrinh} className="flex items-center justify-between p-2 rounded hover:bg-gray-200">
              <div>
                {/* Sửa lại cách truy cập thuộc tính */}
                <p className="font-medium text-sm text-gray-800">{app.HoSoCV?.UngVien?.HoTen || 'Không rõ'}</p>
                <p className="text-xs text-gray-500">{app.ViTriTuyenDung?.TenViTri || 'Không rõ'}</p>
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-100 py-1 px-2 rounded-full">
                {app.TrangThaiHienTai}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Không có ứng viên nào cần chú ý.</p>
        )}
      </div>
    </div>
  );
}