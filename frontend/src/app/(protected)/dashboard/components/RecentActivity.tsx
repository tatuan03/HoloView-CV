// src/app/(protected)/dashboard/components/RecentActivity.tsx
import { cookies } from 'next/headers';

async function getRecentActivities() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  try {
    const res = await fetch('http://localhost:8000/api/v1/activities/recent', {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    return [];
  }
}

export default async function RecentActivity() {
  const activities = await getRecentActivities();
  return (
    <div className="bg-white p-6 rounded-lg shadow h-full">
      <h3 className="font-semibold text-lg mb-4 text-black">Hoạt động gần đây</h3>
      <div className="space-y-4">
        {activities.map((activity: any) => (
          <div key={activity.MaHoatDong} className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-800 text-sm font-bold">
                {activity.NguoiThucHien?.HoTen.charAt(0) || '?'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-800">
                <span className="font-bold">{activity.NguoiThucHien?.HoTen || 'Hệ thống'}</span> {activity.HanhDong}
              </p>
              <p className="text-xs text-gray-800 mt-1">
                {new Date(activity.ThoiGian).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}