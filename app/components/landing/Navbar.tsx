"use client"
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export const Navbar = () => {
  const { openConnectModal } = useConnectModal();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 nova-gradient rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white/90">Nova Wallet</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-white/70 hover:text-white transition-colors">
            Home
          </Link>
          <a href="#about" className="text-white/70 hover:text-white transition-colors">
            About
          </a>
          <a href="#docs" className="text-white/70 hover:text-white transition-colors">
            Docs
          </a>
        </div>

        <Button
          onClick={openConnectModal}
          className="nova-gradient hover:opacity-90 transition-opacity rounded-full text-white"
        >
          <Zap className="w-4 h-4 mr-1" />
          Connect Wallet
        </Button>
      </div>
    </nav>
  );
};
