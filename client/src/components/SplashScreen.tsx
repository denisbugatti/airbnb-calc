/**
 * SplashScreen — abertura full screen Vitacon.
 * Fundo azul #2800FF, logo oficial branco revelado por varredura (wipe).
 * - roda 1× por sessão (sessionStorage "splash-shown")
 * - clique/Esc pula
 * - prefers-reduced-motion: não exibe
 */
import { useEffect, useState } from "react";

const CSS = `
.vsplash{position:fixed;inset:0;z-index:9999;background:#2800FF;display:grid;place-items:center;overflow:hidden;transition:opacity .5s ease;}
.vsplash.out{opacity:0;pointer-events:none;}
.vsplash img{width:min(64vw,600px);height:auto;display:block;
  opacity:0;transform:scale(.96);clip-path:inset(-6% 100% -6% 0);
  animation:vsplash-in .5s cubic-bezier(.23,1,.32,1) .2s forwards,
            vsplash-wipe 1.7s cubic-bezier(.65,0,.35,1) .35s forwards;
  will-change:transform,opacity,clip-path;}
@keyframes vsplash-in{to{opacity:1;transform:scale(1);}}
@keyframes vsplash-wipe{to{clip-path:inset(-6% -2% -6% 0);}}
`;

export function SplashScreen() {
  const [phase, setPhase] = useState<"hidden" | "playing" | "leaving">(() => {
    if (typeof window === "undefined") return "hidden";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shown = sessionStorage.getItem("splash-shown");
    return reduced || shown ? "hidden" : "playing";
  });

  useEffect(() => {
    if (phase !== "playing") return;
    sessionStorage.setItem("splash-shown", "1");
    const leave = () => setPhase("leaving");
    const t = setTimeout(leave, 2800);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") leave(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [phase]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const t = setTimeout(() => setPhase("hidden"), 550);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div className={`vsplash${phase === "leaving" ? " out" : ""}`} onClick={() => setPhase("leaving")} role="presentation">
      <style>{CSS}</style>
      <img src="/vitacon-logo.png" alt="Vitacon" draggable={false} />
    </div>
  );
}
