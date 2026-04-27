"use client";

import { motion } from "framer-motion";

interface Props {
  pct: number;
  show: boolean;
}

export default function ProgressBar({ pct, show }: Props) {
  if (!show) return null;

  return (
    <div className="fixed top-1 left-1 right-1 h-1 rounded-full" style={{ background: "#e8e8e8" }}>
      <motion.div
        style={{ height: "100%", background: "#4a8798", borderRadius: 9999, borderRight: "3px solid #ffffff" }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}