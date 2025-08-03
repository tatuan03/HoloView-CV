import CVUploader from "./components/CVUploader";
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8">
          Hệ thống Quản lý CV
        </h1>
        <CVUploader />
      </div>
    </main>
  );
}