// src/app/(protected)/dashboard/page.tsx
import StatsCards from './components/StatsCards';
import RecentActivity from './components/RecentActivity';
import PriorityCandidates from './components/PriorityCandidates';

// Trang này là một Server Component, nó sẽ tự lấy dữ liệu cho các component con
export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <StatsCards />
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriorityCandidates />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}