"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export const CTASection = () => {
    return (
        <section className="relative mt-24 bg-white overflow-hidden">
            {/* Container for layout */}
            <div className="relative">
                {/* Image positioned above dark background - half outside, half inside */}
                <div className="container mx-auto px-6">
                    <div className="relative lg:flex lg:items-end">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative z-20 lg:w-1/2 mb-8 lg:mb-0"
                        >
                            <div className="relative w-full h-[400px]">
                                <Image
                                    src="/landing-page/let-nova-handle-the-complexity.png"
                                    alt="Let Nova Handle the Complexity"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Dark background section that cuts through the image */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-[350px] pointer-events-none"
                    style={{
                        background: 'linear-gradient(135deg, #1a0a3d 0%, #0f0520 50%, #000000 100%)'
                    }}
                >
                    {/* Vertical stripe pattern overlay */}
                    <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(139, 92, 246, 0.3) 40px, rgba(139, 92, 246, 0.3) 80px)',
                        }}
                    />

                    <div className="container mx-auto px-6 h-full pointer-events-auto">
                        <div className="lg:flex lg:items-center lg:justify-between h-full">
                            {/* Left spacer for image area */}
                            <div className="hidden lg:block lg:w-1/2"></div>

                            {/* Right side - CTA Content */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="lg:w-1/2 flex flex-col justify-center py-8 lg:py-0"
                            >
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                    Let Nova Handle the Complexity
                                </h2>
                                <p className="text-white/60 text-lg mb-6">
                                    Your wallet. Your intent. One conversation
                                </p>
                                <div>
                                    <Link href="/chat">
                                        <Button size="lg" className="nova-gradient rounded-full text-white gap-2 px-8 cursor-pointer navbar">
                                            <Zap className="w-5 h-5" />
                                            Get Started
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Footer integrated at the bottom */}
                <div className="relative z-10 py-6"
                    style={{
                        background: 'linear-gradient(135deg, #1a0a3d 0%, #0f0520 50%, #000000 100%)'
                    }}
                >
                    {/* Vertical stripe pattern overlay for footer */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(139, 92, 246, 0.3) 40px, rgba(139, 92, 246, 0.3) 80px)',
                        }}
                    />

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{
                                        background: 'linear-gradient(180deg, #5543BC 0%, #786BC7 100%)',
                                        boxShadow: '0px 0px 0px 1px #423493'
                                    }}
                                >
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-white/50 text-sm">© 2025 Nova Wallet</span>
                            </div>

                            <div className="flex items-center gap-6">
                                <Link href="/" className="text-white/50 hover:text-white transition-colors text-sm">
                                    Home
                                </Link>
                                <a href="#features" className="text-white/50 hover:text-white transition-colors text-sm">
                                    Features
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
