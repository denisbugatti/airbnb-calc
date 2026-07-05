/**
 * SplashScreen — abertura full screen Vitacon.
 * Fundo azul #2800FF, logo branco com revelação (port do vitacon-logo/index.html, single-run).
 * - roda 1× por sessão (sessionStorage "splash-shown")
 * - clique/Esc pula
 * - prefers-reduced-motion: não exibe
 */
import { useEffect, useState } from "react";

const CSS = `
.vsplash{position:fixed;inset:0;z-index:9999;background:#2800FF;display:grid;place-items:center;overflow:hidden;transition:opacity .5s ease;}
.vsplash.out{opacity:0;pointer-events:none;}
.vsplash svg{width:min(56vw,132svh);max-width:720px;height:auto;shape-rendering:geometricPrecision;}
.vsplash #vSlide,.vsplash #itaconSlide{transform:translateX(137px);animation:vsplash-slide 2.3s .45s cubic-bezier(.65,0,.35,1) forwards;will-change:transform;}
.vsplash #wipe{transform-box:fill-box;transform-origin:0 50%;transform:translateX(137px) scaleX(0);animation:vsplash-wipe 2.3s .45s cubic-bezier(.65,0,.35,1) forwards;will-change:transform;}
.vsplash #vPop{transform-box:fill-box;transform-origin:50% 50%;animation:vsplash-pop .45s cubic-bezier(.65,0,.35,1) both;}
@keyframes vsplash-pop{from{opacity:0;transform:scale(.92);}to{opacity:1;transform:scale(1);}}
@keyframes vsplash-slide{0%{transform:translateX(137px);}18%{transform:translateX(137px);}48%{transform:translateX(0);}100%{transform:translateX(0);}}
@keyframes vsplash-wipe{0%{transform:translateX(137px) scaleX(0);}18%{transform:translateX(137px) scaleX(0);}48%{transform:translateX(0) scaleX(1);}100%{transform:translateX(0) scaleX(1);}}
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
      <svg viewBox="0 0 360 84" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vitacon">
        <defs>
          <clipPath id="reveal" clipPathUnits="userSpaceOnUse">
            <rect id="wipe" x="84" y="-4" width="270" height="92" />
          </clipPath>
        </defs>
        <g id="vSlide">
          <g id="vPop" fill="#fff">
            <polygon points="8,8 20,8 78,78 66,78" />
            <rect x="69" y="8" width="9" height="70" />
          </g>
        </g>
        <g clipPath="url(#reveal)">
          <g id="itaconSlide">
            <g fill="#fff">
              <rect x="89.5" y="24" width="9" height="54" />
              <rect x="89.5" y="8" width="9" height="9.5" rx="2" />
              <rect x="111" y="8" width="9" height="70" />
              <rect x="110" y="24" width="23" height="7" />
              <rect x="176" y="24" width="9" height="54" />
            </g>
            <g fill="none" stroke="#fff" strokeWidth="9">
              <ellipse cx="156" cy="51" rx="16" ry="22.4" />
              <path d="M236.86,65.40 A22.4,22.4 0 1 1 236.86,36.60" strokeLinecap="butt" />
              <circle cx="275" cy="51" r="22.4" />
              <path d="M314,78 L314,46 A17,17 0 0 1 348,46 L348,78" strokeLinecap="butt" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
