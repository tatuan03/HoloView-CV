// src/app/(protected)/dashboard/layout.tsx
import { ReactNode } from 'react';

export default function DashboardSubLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}