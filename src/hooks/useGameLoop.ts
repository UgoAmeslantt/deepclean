import { useEffect, useRef } from "react";

type Callback = (dt: number, time: number) => void;

export default function useGameLoop(callback: Callback, running: boolean) {
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let frame: number;
    function loop(now: number) {
      let dt = now - lastTime.current;
      if (dt > 50) dt = 50; // Clamp à 50ms max
      lastTime.current = now;
      if (running) callback(dt, now);
      frame = requestAnimationFrame(loop);
    }
    if (running) {
      frame = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(frame);
  }, [callback, running]);
} 