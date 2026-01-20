"use client"
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export const Navbar = () => {
  const { openConnectModal } = useConnectModal();

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-[#131313]">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-12 h-12">
            <Image
              src="/navbar-icon.png"
              alt="Nova AI"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>
          <span className="text-lg font-semibold navbar-logo-typography">Nova AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-white/90 hover:text-white transition-colors">
            Home
          </Link>
          <a href="#features" className="text-white/90 hover:text-white transition-colors">
            Features
          </a>
        </div>

        <Button
          onClick={openConnectModal}
          className="navbar hover:opacity-90 transition-opacity rounded-full text-white cursor-pointer"
        >
          <Zap className="w-4 h-4 mr-1" />
          Connect Wallet
        </Button>
      </div>
    </nav>
  );
};
