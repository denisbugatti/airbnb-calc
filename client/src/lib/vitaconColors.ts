/**
 * Paleta Vitacon — fonte única de cores, fiel ao Style Guide (Fev/2025).
 * Paleta principal: preto #000000 · azul PANTONE 2736C #2800FF · branco #FFFFFF.
 * Paleta Private (apoio): #1A1A1A · #898A8E · #B3B3B3 · #F8F7F2.
 *
 * Regra de uso do azul no escuro: #2800FF puro em PREENCHIMENTOS (botões,
 * chips, barras, display grande); para TEXTO pequeno sobre preto usa-se
 * Azul sempre puro #2800FF (fidelidade total ao brand book).
 */
import { useMemo } from "react";

/** Azul da marca — puro, para fills, display e grafismos em qualquer tema */
export const VIT_BLUE = "#2800FF";

function alpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export function useVitaconColors(isDark: boolean) {
  return useMemo(() => {
    // Azul da marca puro em todo lugar (decisão 05/07/2026 — fidelidade ao brand book)
    const blue = "#2800FF";
    const green = isDark ? "#3FD68F" : "#0E8A4A";
    const amber = isDark ? "#FBBF24" : "#B45309";
    const red = isDark ? "#FF6B57" : "#D42600";
    const a = alpha;
    return {
      // Surfaces — preto absoluto + cinza Private
      surface: isDark ? "#1A1A1A" : "#FFFFFF",
      surfaceHover: isDark ? "#202020" : "#FDFDFB",
      border: isDark ? "#2A2A2A" : "#E6E4DD",
      borderFocus: a(blue, 0.6),
      inputBg: isDark ? "#111111" : "#F4F3EE",
      inputBgFocus: isDark ? "#161616" : "#FFFFFF",
      // Text hierarchy — brancos e cinzas Private
      text1: isDark ? "#FFFFFF" : "#000000",
      text2: isDark ? "#E6E6E6" : "#1A1A1A",
      text3: isDark ? "#B3B3B3" : "#5C5C5C",
      text4: isDark ? "#898A8E" : "#898A8E",
      // Accents — azul da marca
      blue,
      blueGlow: a(VIT_BLUE, isDark ? 0.22 : 0.08),
      blueBorder: a(blue, isDark ? 0.4 : 0.25),
      blueBg: a(VIT_BLUE, isDark ? 0.12 : 0.06),
      blueIconBg: a(VIT_BLUE, isDark ? 0.22 : 0.09),
      blueHead: a(VIT_BLUE, isDark ? 0.28 : 0.1),
      blueCell: a(VIT_BLUE, isDark ? 0.1 : 0.04),
      // Verde — positivo
      green,
      greenGlow: a(green, isDark ? 0.16 : 0.08),
      greenBorder: a(green, 0.3),
      greenBg: a(green, isDark ? 0.1 : 0.06),
      greenIconBg: a(green, isDark ? 0.16 : 0.09),
      greenHead: a(green, isDark ? 0.2 : 0.1),
      greenCell: a(green, isDark ? 0.08 : 0.04),
      // Âmbar — despesas
      amber,
      amberGlow: a(amber, isDark ? 0.16 : 0.08),
      amberBorder: a(amber, 0.3),
      amberBg: a(amber, isDark ? 0.1 : 0.06),
      amberIconBg: a(amber, isDark ? 0.16 : 0.09),
      // Vermelho — negativo
      red,
      redGlow: a(red, isDark ? 0.16 : 0.08),
      redBorder: a(red, 0.3),
      redBg: a(red, isDark ? 0.1 : 0.06),
      // Violet → azul da marca (compat com chaves antigas do Fluxo)
      violet: blue,
      violetGlow: a(VIT_BLUE, isDark ? 0.22 : 0.08),
      violetBorder: a(blue, isDark ? 0.4 : 0.25),
      violetBg: a(VIT_BLUE, isDark ? 0.12 : 0.06),
      violetIconBg: a(VIT_BLUE, isDark ? 0.22 : 0.09),
      violetHead: a(VIT_BLUE, isDark ? 0.28 : 0.1),
      violetCell: a(VIT_BLUE, isDark ? 0.1 : 0.04),
      // Divider
      divider: isDark ? "#242424" : "#ECEAE3",
      // Shadows
      cardShadow: isDark
        ? "none"
        : "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)",
      cardShadowHover: isDark
        ? "none"
        : "0 2px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.08)",
      inputShadow: isDark ? "none" : "inset 0 1px 2px rgba(0,0,0,0.03)",
      focusShadow: `0 0 0 3px ${a(blue, 0.15)}`,
      // Mono font color
      mono: isDark ? "#FFFFFF" : "#000000",
    };
  }, [isDark]);
}
