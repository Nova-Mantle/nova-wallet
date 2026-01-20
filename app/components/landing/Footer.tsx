"use client";

import { Zap } from "lucide-react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="py-8 bg-black">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 nova-gradient rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/50 text-sm">© 2025 Nova Wallet</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="text-white/50 hover:text-white transition-colors text-sm">
              Home
            </Link>
            <a href="#about" className="text-white/50 hover:text-white transition-colors text-sm">
              About
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
