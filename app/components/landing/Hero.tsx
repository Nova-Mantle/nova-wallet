"use client";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import Image from "next/image";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
      {/* Background Effects */}
      {/* Gradient top layer to match navbar - fades smoothly */}
      <div className="absolute top-0 left-0 right-0 h-[200px]" style={{
        background: 'linear-gradient(180deg, #131313 0%, #131313 70%, rgba(19,19,19,0.8) 85%, rgba(19,19,19,0) 100%)',
        filter: 'blur(0px)'
      }} />

      {/* Base gradient layer - dynamic height */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[85vh] rounded-b-[100%]" style={{
        background: 'linear-gradient(180deg, #131313 0%, #131313 70%, #1a0a4d 80%, #3904C8 88%, #6b3dd9 93%, rgba(214,196,255,0.6) 96%, rgba(255,255,255,0.3) 98%, rgba(255,255,255,0.1) 100%)',
        filter: 'blur(40px)'
      }} />

      {/* Blur layer only at the edges/perimeter - dynamic height */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[85vh] rounded-b-[100%]" style={{
        background: 'radial-gradient(ellipse 60% 80% at 50% 20%, transparent 0%, transparent 60%, #3904C8 88%, #8b6dd9 93%, rgba(214,196,255,0.4) 96%, rgba(255,255,255,0.2) 100%)',
        filter: 'blur(60px)'
      }} />

      {/* Hero Decoration Image */}
      <div className="absolute right-0 top-48 hidden lg:block z-100">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-[40vw] h-[30vw] max-w-[700px] max-h-[550px]"
        >
          <Image
            src="/landing-page/hero-decoration.png"
            alt="Hero Decoration"
            fill
            className="object-contain object-top-right"
            priority
          />
        </motion.div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl -mt-40">
          {/* Main Heading with special typography */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <span className="block text-5xl md:text-[70px] font-normal text-white/90 mb-2" style={{ fontFamily: 'var(--font-bruno-ace)', lineHeight: '100%', letterSpacing: '-0.02em' }}>
              AI-POWERED
            </span>
            <span className="text-5xl md:text-[70px] font-normal text-white/90 flex items-center gap-6" style={{ fontFamily: 'var(--font-bruno-ace)', lineHeight: '100%', letterSpacing: '-0.02em' }}>
              CRYPTO
              <div className="ml-2">
                {/* Floating Icon - matching SVG design */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="relative"
                >
                  {/* Behind icon - rotated purple square */}
                  <div
                    className="absolute -left-4 -top-4 w-[56px] h-[56px] rounded-[14px] rotate-[-19deg]"
                    style={{ background: 'linear-gradient(180deg, #7069EC 0%, #5753DF 100%)' }}
                  />
                  {/* Main icon container with glass effect */}
                  <div
                    className="relative w-[57px] h-[57px] rounded-[12px] rotate-[-4deg] flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(225.82deg, rgba(140, 132, 251, 0.4) 0%, rgba(54, 54, 201, 0.4) 98.6%)',
                      backdropFilter: 'blur(7px)',
                      border: '0.72px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <Zap className="w-7 h-7 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                  </div>
                </motion.div>
              </div>
            </span>
            <span className="block text-5xl md:text-[70px] font-normal text-white/90" style={{ fontFamily: 'var(--font-bruno-ace)', lineHeight: '100%', letterSpacing: '-0.02em' }}>
              SUPERWALLET
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 mb-10 max-w-xl leading-relaxed"
          >
            Nova is an AI-powered chat interface that helps you interact with crypto through natural language, from sending assets to understanding on-chain activity
          </motion.p>
        </div>
      </div>
    </section>
  );
};
