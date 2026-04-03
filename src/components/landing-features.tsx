"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Bell,
  Brain,
  LineChart,
  Shield,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  brain: Brain,
  sparkles: Sparkles,
  bell: Bell,
  chart: LineChart,
  shield: Shield,
};

export function LandingFeatures({
  items,
}: {
  items: { icon: string; title: string; body: string }[];
}) {
  return (
    <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-20 md:mt-24">
      {items.map((item, i) => {
        const Icon = icons[item.icon] ?? Brain;
        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="h-full hover:shadow-soft-lg transition-all duration-300 border-slate-200/60 dark:border-slate-700/50 hover:border-teal-500/20 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/15 to-cyan-500/10 text-teal-600 dark:text-teal-400 mb-4 group-hover:scale-105 transition-transform duration-300">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.body}</p>
            </Card>
          </motion.div>
        );
      })}
    </section>
  );
}
