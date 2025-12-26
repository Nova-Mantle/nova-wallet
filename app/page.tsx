import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0014] text-white overflow-hidden">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
