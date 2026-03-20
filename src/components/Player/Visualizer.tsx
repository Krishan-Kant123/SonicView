"use client";

import { usePlayerStore } from '@/store/player.store';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Visualizer() {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  // To avoid hydration mismatch, initialize after mount or just render the array
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-12 w-full" />;

  const numBars = 72;
  const bars = Array.from({ length: numBars });

  return (
    <div className="relative w-full h-full rounded-full">
      {bars.map((_, i) => {
        // Pseudo-random deterministic values
        const rotation = (360 / numBars) * i;
        const seed = Math.abs(Math.sin(i * 12.345));
        const duration = seed * 0.4 + 0.4; // 0.4s to 0.8s
        const maxH = seed * 30 + 10; // 10px to 40px outwards height
        const delay = (seed * 10) % 1;

        return (
          <div
            key={i}
            className="absolute top-0 left-1/2 w-1.5 -ml-[3px] h-1/2 origin-bottom"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <motion.div
              className="absolute bottom-full left-0 w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-full opacity-70"
              initial={{ height: "4px" }}
              animate={{
                height: isPlaying ? ["4px", `${maxH}px`, "4px"] : "4px"
              }}
              transition={isPlaying ? {
                duration: duration,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: delay
              } : { 
                duration: 0.3,
                ease: "easeOut"
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
