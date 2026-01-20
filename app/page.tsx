import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTASection } from "./components/landing/CTASection";

export default function Landing() {
  return (
    <div className="min-h-screen text-white bg-white overflow-hidden relative">
      <Navbar />
      <Hero />
      <Features />
      <CTASection />
    </div>
  );
}
