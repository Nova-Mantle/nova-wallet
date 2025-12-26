"use client";

import { motion } from "framer-motion";
import { Zap, Shield, MessageSquare, Link as LinkIcon, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const featureCards = [
  {
    title: "From Blue Chips to Long Tails",
    description: "See and act on your assets across wallets and chains in one place",
    icon: Layers,
    dark: true,
  },
  {
    title: "AI-native Execution",
    description: "Nova powers the moment your words become on-chain reality",
    icon: Zap,
    dark: true,
    glow: true,
  },
  {
    title: "No menus. No manual steps.",
    description: "Express what you want to do. Nova prepares everything else in seconds",
    icon: ArrowRight,
    dark: true,
  },
  {
    title: "One link. Any payment method.",
    description: "Create a single payment link that adapts to how the payer wants to pay",
    icon: LinkIcon,
    dark: true,
  },
  {
    title: "Address Intelligence",
    description: "Known contracts, fresh wallets, and risky patterns detected automatically",
    icon: Shield,
    dark: true,
    glow: true,
  },
  {
    title: "One intent. Multiple actions.",
    description: "Send, swap, receive, and pay — all triggered through natural language",
    icon: MessageSquare,
    dark: true,
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      {/* Info Card */}
      <div className="container mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/80 via-purple-800/60 to-purple-900/80 p-8 md:p-12 border border-purple-500/20"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Get to Know Nova Wallet More
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Nova is an AI-native interface designed to simplify how humans interact with blockchains. Instead of navigating complex wallet menus or block explorers, users express intent through conversation while Nova handles analysis, context, and execution across connected wallets.
            </p>
            <Link href="/chat">
              <Button className="nova-gradient rounded-full text-white gap-2">
                <Zap className="w-4 h-4" />
                Get Started
              </Button>
            </Link>
          </div>

          {/* Floating icons on the right */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-wrap gap-3 max-w-[200px]">
            {[Shield, MessageSquare, Layers, Zap, LinkIcon, ArrowRight].map((Icon, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="w-12 h-12 rounded-xl bg-purple-700/50 backdrop-blur flex items-center justify-center border border-purple-400/20"
              >
                <Icon className="w-5 h-5 text-white/80" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Feature Grid */}
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-2xl p-6 h-64 flex flex-col justify-end ${feature.dark
                ? 'bg-gradient-to-br from-gray-900 to-gray-950 border border-white/5'
                : 'bg-purple-900/30 border border-purple-500/20'
                }`}
            >
              {feature.glow && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl" />
              )}

              <div className="absolute top-6 left-6 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-white/70" />
              </div>

              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 mt-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Chat Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 max-w-md"
          >
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-gray-900/50 shadow-2xl">
              <div className="h-8 bg-gray-900 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-4 text-xs text-white/50">Chat with Nova AI</span>
              </div>
              <div className="p-6 bg-gray-800/50">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center">
                    <span className="text-2xl">🌐</span>
                  </div>
                </div>
                <p className="text-center text-white/90 font-medium mb-1">Welcome to Nova AI</p>
                <p className="text-center text-white/50 text-sm mb-6">How can I help?</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Send", "Receive", "Swap", "Paylink"].map((action) => (
                    <div key={action} className="p-3 rounded-xl bg-gray-700/50 border border-white/5 text-center">
                      <span className="text-sm text-white/70">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Let Nova Handle the Complexity
            </h2>
            <p className="text-white/60 text-lg mb-8">
              Your wallet. Your intent. One conversation
            </p>
            <Link href="/chat">
              <Button size="lg" className="nova-gradient rounded-full text-white gap-2 px-8">
                <Zap className="w-5 h-5" />
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
