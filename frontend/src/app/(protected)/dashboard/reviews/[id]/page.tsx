// src/app/(protected)/dashboard/reviews/[id]/page.tsx
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ReviewClientView from './ReviewClientView'; // Import client component

// Hàm lấy dữ liệu từ server
async function getReviewDetails(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token');
  try {
    const response = await fetch(`http://localhost:8000/api/v1/technical-reviews/${id}`, {
      headers: { 'Authorization': `Bearer ${token?.value || ''}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Failed to fetch review details:", error);
    return null;
  }
}

// Page component là một Server Component
export default async function ReviewDetailPage({ params }: { params: { id: string } }) {
  // Lấy dữ liệu ban đầu ở phía server
  const reviewDetails = await getReviewDetails(params.id);

  // Nếu không có dữ liệu, hiển thị trang 404
  if (!reviewDetails) {
    notFound();
  }

  // Render ra Client Component và truyền dữ liệu ban đầu vào
  return <ReviewClientView initialDetails={reviewDetails} />;
}