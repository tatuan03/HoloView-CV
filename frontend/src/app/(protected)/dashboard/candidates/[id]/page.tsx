// src/app/(protected)/dashboard/candidates/[id]/page.tsx
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import CandidateClientView from './CandidateClientView'; 

import { CandidateDetails } from '@/types';

// --- Hàm lấy dữ liệu ---
async function getCandidateDetails(id: string): Promise<CandidateDetails | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token');
  try {
    const response = await fetch(`http://localhost:8000/api/v1/candidates/${id}`, {
      headers: { 'Authorization': `Bearer ${token?.value || ''}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    return null;
  }
}

// --- Page component là một Server Component ---
export default async function CandidateDetailPage({ params }: { params: { id: string } }) {
  // Lấy dữ liệu ban đầu ở phía server
  const initialData = await getCandidateDetails(params.id);

  // Nếu không có dữ liệu, hiển thị trang 404
  if (!initialData) {
    notFound();
  }

  // Render ra Client Component và truyền dữ liệu ban đầu vào
  return <CandidateClientView initialData={initialData} />;
}