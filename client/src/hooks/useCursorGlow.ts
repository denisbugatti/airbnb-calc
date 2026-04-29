import { useEffect } from "react";
import { useMotionValue, useSpring } from "framer-motion";

export function useCursorGlow() {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 18 });
  const opacity = useMotionValue(0);
  const springOpacity = useSpring(opacity, { stiffness: 50, damping: 20 });

  useEffect(() => {
    let fadeTimeout: ReturnType<typeof setTimeout>;

    const handleMove = (x: number, y: number) => {
      mouseX.set(x);
      mouseY.set(y);
      opacity.set(1);
      clearTimeout(fadeTimeout);
      fadeTimeout = setTimeout(() => opacity.set(0), 2500);
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) handleMove(t.clientX, t.clientY);
    };
    const onTouchEnd = () => {
      fadeTimeout = setTimeout(() => opacity.set(0), 1000);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      clearTimeout(fadeTimeout);
    };
  }, [mouseX, mouseY, opacity]);

  return { springX, springY, springOpacity };
}
