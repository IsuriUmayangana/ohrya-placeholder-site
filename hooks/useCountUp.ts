import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration = 1200) {
    const [value, setValue] = useState(0);
    const rafRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
  
    useEffect(() => {
      if (target === 0) {
        setValue(0);
        return;
      }
      setValue(0);
      startTimeRef.current = null;
  
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  
      const tick = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        setValue(Math.round(easeOut(progress) * target));
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      };
  
      rafRef.current = requestAnimationFrame(tick);
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [target, duration]);
  
    return value;
  }

export default useCountUp;