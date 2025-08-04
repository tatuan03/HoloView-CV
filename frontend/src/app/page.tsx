// src/app/page.tsx
import HeroSection from "./components/HeroSection";
import UploadSection from "./components/UploadSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <UploadSection />
    </main>
  );
}