// src/app/(protected)/dashboard/components/StatsCards.tsx
import { cookies } from 'next/headers';

interface StatsData {
  new_cvs_this_week: number;
  waiting_for_review: number;
  interviews_today: number;
  hired_this_month: number;
}

async function getStats(): Promise<StatsData> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  try {
    const res = await fetch('http://localhost:8000/api/v1/stats/overview', {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return { new_cvs_this_week: 0, waiting_for_review: 0, interviews_today: 0, hired_this_month: 0 };
    return res.json();
  } catch (error) {
    return { new_cvs_this_week: 0, waiting_for_review: 0, interviews_today: 0, hired_this_month: 0 };
  }
}

export default async function StatsCards() {
  const stats = await getStats();

  const statItems = [
    { title: "CV mới trong tuần", value: stats.new_cvs_this_week },
    { title: "Chờ đánh giá KT", value: stats.waiting_for_review },
    { title: "Phỏng vấn hôm nay", value: stats.interviews_today },
    { title: "Đã tuyển tháng này", value: stats.hired_this_month },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 mt-8">
      {statItems.map(item => (
        <div key={item.title} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{item.title}</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}