/**
 * Paleta Vitacon — fonte única de cores para Home, Fluxo e componentes.
 * Azul elétrico #2800FF (marca) · verde positivo · âmbar despesas · vermelho negativo.
 * No dark, o azul clareia para #6E5CFF (contraste AA sobre #0A0A0B).
 */
import { useMemo } from "react";

function alpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export function useVitaconColors(isDark: boolean) {
  return useMemo(() => {
    const blue = isDark ? "#6E5CFF" : "#2800FF";
    const green = isDark ? "#3FD68F" : "#0E8A4A";
    const amber = isDark ? "#FBBF24" : "#B45309";
    const red = isDark ? "#FF6B57" : "#D42600";
    const a = alpha;
    return {
      // Surfaces
      surface: isDark ? "#141414" : "#FFFFFF",
      surfaceHover: isDark ? "#1A1A1A" : "#FAFAFA",
      border: isDark ? "#262626" : "#E5E5E5",
      borderFocus: a(blue, 0.6),
      inputBg: isDark ? "#1A1A1A" : "#F7F7F7",
      inputBgFocus: isDark ? "#1F1F1F" : "#FFFFFF",
      // Text hierarchy
      text1: isDark ? "#FFFFFF" : "#0A0A0B",
      text2: isDark ? "#E6E6E6" : "#333333",
      text3: isDark ? "#999999" : "#666666",
      text4: isDark ? "#666666" : "#999999",
      // Accents — azul da marca
      blue,
      blueGlow: a(blue, isDark ? 0.16 : 0.08),
      blueBorder: a(blue, 0.25),
      blueBg: a(blue, 0.06),
      blueIconBg: a(blue, isDark ? 0.14 : 0.09),
      blueHead: a(blue, isDark ? 0.16 : 0.1),
      blueCell: a(blue, isDark ? 0.07 : 0.04),
      // Verde — positivo
      green,
      greenGlow: a(green, isDark ? 0.16 : 0.08),
      greenBorder: a(green, 0.25),
      greenBg: a(green, 0.06),
      greenIconBg: a(green, isDark ? 0.14 : 0.09),
      greenHead: a(green, isDark ? 0.16 : 0.1),
      greenCell: a(green, isDark ? 0.07 : 0.04),
      // Âmbar — despesas
      amber,
      amberGlow: a(amber, isDark ? 0.16 : 0.08),
      amberBorder: a(amber, 0.25),
      amberBg: a(amber, 0.06),
      amberIconBg: a(amber, isDark ? 0.14 : 0.09),
      // Vermelho — negativo
      red,
      redGlow: a(red, isDark ? 0.16 : 0.08),
      redBorder: a(red, 0.25),
      redBg: a(red, 0.06),
      // Violet → mapeado para o azul da marca (compat com chaves antigas do Fluxo)
      violet: blue,
      violetGlow: a(blue, isDark ? 0.16 : 0.08),
      violetBorder: a(blue, 0.25),
      violetBg: a(blue, 0.06),
      violetIconBg: a(blue, isDark ? 0.14 : 0.09),
      violetHead: a(blue, isDark ? 0.16 : 0.1),
      violetCell: a(blue, isDark ? 0.07 : 0.04),
      // Divider
      divider: isDark ? "#232323" : "#ECECEC",
      // Shadows
      cardShadow: isDark
        ? "none"
        : "0 1px 2px rgba(10,10,11,0.04), 0 8px 24px rgba(10,10,11,0.05)",
      cardShadowHover: isDark
        ? "none"
        : "0 2px 8px rgba(10,10,11,0.06), 0 12px 32px rgba(10,10,11,0.08)",
      inputShadow: isDark ? "none" : "inset 0 1px 2px rgba(10,10,11,0.03)",
      focusShadow: `0 0 0 3px ${a(blue, 0.12)}`,
      // Mono font color
      mono: isDark ? "#FFFFFF" : "#0A0A0B",
    };
  }, [isDark]);
}
