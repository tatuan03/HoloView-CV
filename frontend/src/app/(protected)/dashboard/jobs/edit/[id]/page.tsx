// src/app/(protected)/dashboard/jobs/edit/[id]/page.tsx
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import EditJobClientView from './EditJobClientView';

async function getJobDetails(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  try {
    const response = await fetch(`http://localhost:8000/api/v1/job_positions/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const data = await response.json();
    // Định dạng lại ngày cho input type="date"
    if (data.NgayHetHan) {
        data.NgayHetHan = new Date(data.NgayHetHan).toISOString().split('T')[0];
    }
    return data;
  } catch (error) {
    console.error("Failed to fetch job details:", error);
    return null;
  }
}

export default async function EditJobPage({ params }: { params: { id: string } }) {
  const initialJobData = await getJobDetails(params.id);

  if (!initialJobData) {
    notFound();
  }

  return <EditJobClientView jobId={params.id} initialJobData={initialJobData} />;
}