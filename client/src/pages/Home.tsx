/**
 * Home.tsx — Calculadora de Rentabilidade Short Stay
 * Dual theme: Dark Cosmos / Slate Premium
 * Cores adaptativas via useTheme() — sem oklch hardcoded
 */

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  calcular,
  formatCurrency,
  formatPercent,
  defaultInputs,
  type CalculatorInputs,
} from "@/lib/calculator";
import { useFluxo } from "@/contexts/FluxoContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Building2, TrendingUp, DollarSign, Percent,
  ChevronDown, ChevronUp, Info, Home, Zap, BarChart3,
  Shield, User, Minus, Calculator, Wifi, Droplets, Bolt,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { encodeShareLink, decodeShareLink, copyToClipboard } from "@/lib/shareLink";
import { Link2, Check, BookmarkPlus } from "lucide-react";
import { useCenarios, type Cenario } from "@/contexts/CenariosContext";

// ─── Animated Number ──────────────────────────────────────────────────────────
function useAnimatedNumber(value: number, duration = 500) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(start + (end - start) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else prevRef.current = end;
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);
  return displayed;
}

// ─── Theme-aware color tokens ─────────────────────────────────────────────────
function useColors(isDark: boolean) {
  return useMemo(() => ({
    // Surfaces
    surface: isDark ? "oklch(1 0 0 / 0.04)" : "oklch(1 0 0)",
    surfaceHover: isDark ? "oklch(1 0 0 / 0.07)" : "oklch(0.98 0.003 80)",
    border: isDark ? "oklch(1 0 0 / 0.08)" : "oklch(0.88 0.008 240)",
    borderFocus: isDark ? "oklch(0.78 0.12 210 / 0.5)" : "oklch(0.52 0.22 250 / 0.6)",
    inputBg: isDark ? "oklch(1 0 0 / 0.04)" : "oklch(0.97 0.004 240)",
    inputBgFocus: isDark ? "oklch(1 0 0 / 0.07)" : "oklch(1 0 0)",
    // Text hierarchy
    text1: isDark ? "oklch(0.97 0 0)" : "oklch(0.18 0.01 260)",      // heading
    text2: isDark ? "oklch(0.75 0 0)" : "oklch(0.35 0.01 260)",      // subheading
    text3: isDark ? "oklch(0.55 0.01 240)" : "oklch(0.52 0.01 260)", // label
    text4: isDark ? "oklch(0.38 0.01 240)" : "oklch(0.65 0.01 260)", // caption
    // Accents
    blue: isDark ? "oklch(0.78 0.12 210)" : "oklch(0.52 0.22 250)",
    blueGlow: isDark ? "oklch(0.78 0.12 210 / 0.15)" : "oklch(0.52 0.22 250 / 0.08)",
    blueBorder: isDark ? "oklch(0.78 0.12 210 / 0.2)" : "oklch(0.52 0.22 250 / 0.25)",
    blueBg: isDark ? "oklch(0.78 0.12 210 / 0.06)" : "oklch(0.52 0.22 250 / 0.06)",
    blueIconBg: isDark ? "oklch(0.78 0.12 210 / 0.12)" : "oklch(0.52 0.22 250 / 0.1)",
    green: isDark ? "oklch(0.72 0.18 145)" : "oklch(0.48 0.18 145)",
    greenGlow: isDark ? "oklch(0.72 0.18 145 / 0.15)" : "oklch(0.48 0.18 145 / 0.08)",
    greenBorder: isDark ? "oklch(0.72 0.18 145 / 0.2)" : "oklch(0.48 0.18 145 / 0.25)",
    greenBg: isDark ? "oklch(0.72 0.18 145 / 0.06)" : "oklch(0.48 0.18 145 / 0.06)",
    greenIconBg: isDark ? "oklch(0.72 0.18 145 / 0.12)" : "oklch(0.48 0.18 145 / 0.1)",
    amber: isDark ? "oklch(0.78 0.18 70)" : "oklch(0.6 0.18 70)",
    amberGlow: isDark ? "oklch(0.78 0.18 70 / 0.15)" : "oklch(0.6 0.18 70 / 0.08)",
    amberBorder: isDark ? "oklch(0.78 0.18 70 / 0.2)" : "oklch(0.6 0.18 70 / 0.25)",
    amberBg: isDark ? "oklch(0.78 0.18 70 / 0.06)" : "oklch(0.6 0.18 70 / 0.06)",
    amberIconBg: isDark ? "oklch(0.78 0.18 70 / 0.12)" : "oklch(0.6 0.18 70 / 0.1)",
    red: isDark ? "oklch(0.65 0.22 25)" : "oklch(0.52 0.22 25)",
    redGlow: isDark ? "oklch(0.65 0.22 25 / 0.15)" : "oklch(0.52 0.22 25 / 0.08)",
    redBorder: isDark ? "oklch(0.65 0.22 25 / 0.2)" : "oklch(0.52 0.22 25 / 0.25)",
    redBg: isDark ? "oklch(0.65 0.22 25 / 0.06)" : "oklch(0.52 0.22 25 / 0.06)",
    // Divider
    divider: isDark ? "oklch(1 0 0 / 0.06)" : "oklch(0.88 0.008 240)",
    // Shadow
    cardShadow: isDark ? "none" : "0 1px 3px oklch(0 0 0 / 0.06), 0 4px 16px oklch(0 0 0 / 0.05)",
    cardShadowHover: isDark ? "none" : "0 2px 8px oklch(0 0 0 / 0.08), 0 8px 32px oklch(0 0 0 / 0.08)",
    inputShadow: isDark ? "none" : "inset 0 1px 2px oklch(0 0 0 / 0.04)",
    focusShadow: isDark ? "0 0 0 3px oklch(0.78 0.12 210 / 0.1)" : "0 0 0 3px oklch(0.52 0.22 250 / 0.12)",
    // Mono font color
    mono: isDark ? "oklch(0.95 0 0)" : "oklch(0.18 0.01 260)",
  }), [isDark]);
}

// ─── Helpers de formatação de milhar ─────────────────────────────────────────
function applyThousandsMask(raw: string): string {
  // Mantém apenas dígitos
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  // Remove zeros à esquerda
  const trimmed = digits.replace(/^0+(?=\d)/, "");
  // Aplica pontos de milhar
  return trimmed.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function parseThousands(str: string): number {
  const clean = str.replace(/\./g, "");
  const num = parseInt(clean, 10);
  return isNaN(num) ? 0 : num;
}
function formatThousands(num: number): string {
  if (!num) return "";
  return Math.round(num).toLocaleString("pt-BR");
}
// ─── Input Field ──────────────────────────────────────────────────────────────
interface InputFieldProps {
  label: string; value: number; onChange: (v: number) => void;
  prefix?: string; suffix?: string; min?: number; step?: number;
  tooltip?: string; integer?: boolean; icon?: React.ReactNode;
  isDark: boolean; colors: ReturnType<typeof useColors>;
}
function InputField({ label, value, onChange, prefix, suffix, min = 0, step = 1, tooltip, integer = false, icon, isDark: _isDark, colors }: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Valor exibido fora do foco: sempre com pontos de milhar
  const displayValue = focused ? undefined : formatThousands(value);
  const handleFocus = useCallback(() => {
    setFocused(true);
    if (inputRef.current) {
      inputRef.current.value = formatThousands(value);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [value]);
  const handleBlur = useCallback(() => {
    setFocused(false);
    if (inputRef.current) {
      const parsed = parseThousands(inputRef.current.value);
      const clamped = Math.max(min, parsed);
      onChange(clamped);
      inputRef.current.value = formatThousands(clamped);
    }
  }, [onChange, min]);
  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const raw = el.value;
    const cursor = el.selectionStart ?? raw.length;
    const dotsBefore = (raw.slice(0, cursor).match(/\./g) || []).length;
    const formatted = applyThousandsMask(raw);
    el.value = formatted;
    const newDotsBefore = (formatted.slice(0, cursor).match(/\./g) || []).length;
    const newCursor = Math.max(0, cursor + (newDotsBefore - dotsBefore));
    el.setSelectionRange(newCursor, newCursor);
    onChange(parseThousands(formatted));
  }, [onChange]);
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") { e.preventDefault(); const v = Math.max(min, value + step); onChange(v); if (inputRef.current) inputRef.current.value = formatThousands(v); }
    else if (e.key === "ArrowDown") { e.preventDefault(); const v = Math.max(min, value - step); onChange(v); if (inputRef.current) inputRef.current.value = formatThousands(v); }
    else if (e.key === "Enter") inputRef.current?.blur();
  }, [value, step, min, onChange]);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {icon && <span style={{ color: colors.text3 }}>{icon}</span>}
          <label className="text-xs font-medium" style={{ color: colors.text3 }}>{label}</label>
        </div>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info size={11} className="cursor-help" style={{ color: colors.text4 }} />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-48 text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div
        className="flex items-center rounded-xl transition-all duration-200"
        style={{
          background: focused ? colors.inputBgFocus : colors.inputBg,
          border: `1px solid ${focused ? colors.borderFocus : colors.border}`,
          boxShadow: focused ? colors.focusShadow : colors.inputShadow,
        }}
      >
        {prefix && <span className="pl-3 text-sm font-medium select-none" style={{ color: colors.text3 }}>{prefix}</span>}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          defaultValue={displayValue}
          key={focused ? "editing" : `v-${value}`}
          placeholder="0"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent px-3 py-3 text-sm font-medium outline-none min-w-0"
          style={{ color: colors.mono, fontFamily: "'Geist Mono', monospace" }}
          autoComplete="off"
        />
        {suffix && <span className="pr-2 text-xs select-none" style={{ color: colors.text3 }}>{suffix}</span>}
        <div className="flex flex-col border-l" style={{ borderColor: colors.divider }}>
          <button onClick={() => { const v = Math.max(min, value + step); onChange(v); }} className="px-2.5 py-2 transition-colors rounded-tr-xl" style={{ color: colors.text3 }}>
            <ChevronUp size={13} />
          </button>
          <button onClick={() => { const v = Math.max(min, value - step); onChange(v); }} className="px-2.5 py-2 transition-colors rounded-br-xl" style={{ color: colors.text3 }}>
            <ChevronDown size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ value, label, formatter, icon, accent, size = "md", isDark, colors }: {
  value: number; label: string; formatter: (v: number) => string;
  icon: React.ReactNode; accent: "blue" | "green" | "amber" | "red";
  size?: "md" | "lg"; isDark: boolean; colors: ReturnType<typeof useColors>;
}) {
  const animated = useAnimatedNumber(value);
  const accentColor = colors[accent as keyof typeof colors] as string;
  const accentGlow = colors[`${accent}Glow` as keyof typeof colors] as string;
  const accentIconBg = colors[`${accent}IconBg` as keyof typeof colors] as string;
  const accentBorder = colors[`${accent}Border` as keyof typeof colors] as string;
  const accentBg = colors[`${accent}Bg` as keyof typeof colors] as string;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-3 md:p-4 flex flex-col gap-1.5"
      style={{
        background: accentBg,
        border: `1px solid ${accentBorder}`,
        boxShadow: isDark ? `0 4px 32px ${accentGlow}` : `0 2px 12px ${accentGlow}`,
      }}
    >
      <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: accentIconBg, color: accentColor }}>
        {icon}
      </div>
      <div className={`font-black tracking-tight ${size === "lg" ? "text-2xl md:text-3xl" : "text-xl"}`}
        style={{ color: accentColor, fontFamily: "'Geist', sans-serif", textShadow: isDark ? `0 0 24px ${accentGlow}` : "none" }}>
        {formatter(animated)}
      </div>
      <div className="text-xs mt-0.5 font-medium" style={{ color: colors.text3 }}>{label}</div>
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, label, colors }: { icon: React.ReactNode; label: string; colors: ReturnType<typeof useColors> }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: colors.blueIconBg, color: colors.blue }}>{icon}</div>
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: colors.blue }}>{label}</span>
    </div>
  );
}

// ─── Waterfall Bar ────────────────────────────────────────────────────────────
function WaterfallBar({ label, value, total, color, isNegative = false, colors }: {
  label: string; value: number; total: number; color: string; isNegative?: boolean; colors: ReturnType<typeof useColors>;
}) {
  const pct = total > 0 ? Math.min((Math.abs(value) / total) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <div className="w-24 md:w-32 text-right shrink-0">
        <span className="text-xs" style={{ color: colors.text3 }}>{label}</span>
      </div>
      <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: colors.inputBg }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full rounded-full" style={{ background: color }}
        />
      </div>
      <div className="w-20 md:w-24 shrink-0 text-right">
        <span className="text-xs font-semibold" style={{ color: isNegative ? colors.red : color, fontFamily: "'Geist Mono', monospace" }}>
          {isNegative ? "−" : ""}{formatCurrency(Math.abs(value))}
        </span>
      </div>
    </div>
  );
}

// ─── Fiscal Card ──────────────────────────────────────────────────────────────
function FiscalCard({ label, renda, rentabilidade, icon, accent, isHighlight = false, isDark, colors }: {
  label: string; renda: number; rentabilidade: number;
  icon: React.ReactNode; accent: "blue" | "green" | "amber"; isHighlight?: boolean;
  isDark: boolean; colors: ReturnType<typeof useColors>;
}) {
  const accentColor = colors[accent as keyof typeof colors] as string;
  const accentGlow = colors[`${accent}Glow` as keyof typeof colors] as string;
  const accentBorder = colors[`${accent}Border` as keyof typeof colors] as string;
  const accentBg = colors[`${accent}Bg` as keyof typeof colors] as string;
  const accentIconBg = colors[`${accent}IconBg` as keyof typeof colors] as string;
  const animRenda = useAnimatedNumber(renda);
  const animRent = useAnimatedNumber(rentabilidade);
  return (
    <div
      className="rounded-2xl p-3 md:p-4 flex flex-col gap-2 transition-all duration-300"
      style={{
        background: isHighlight ? accentBg : colors.surface,
        border: `1px solid ${isHighlight ? accentBorder : colors.border}`,
        boxShadow: isHighlight
          ? isDark ? `0 4px 32px ${accentGlow}` : `0 2px 16px ${accentGlow}`
          : colors.cardShadow,
      }}
    >
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: accentIconBg, color: accentColor }}>{icon}</div>
        <span className="text-xs font-bold tracking-wider uppercase" style={{ color: accentColor }}>{label}</span>
      </div>
      <div>
        <div className="text-lg md:text-2xl font-black" style={{ color: accentColor, fontFamily: "'Geist', sans-serif", textShadow: isDark ? `0 0 20px ${accentGlow}` : "none" }}>
          {formatCurrency(animRenda)}
        </div>
        <div className="text-xs mt-0.5" style={{ color: colors.text3 }}>renda / mês</div>
      </div>
      <div className="pt-2 border-t" style={{ borderColor: colors.divider }}>
        <div className="text-base md:text-lg font-bold" style={{ color: accentColor, fontFamily: "'Geist Mono', monospace" }}>
          {formatPercent(animRent)} a.a.
        </div>
        <div className="text-xs mt-0.5" style={{ color: colors.text3 }}>rentabilidade anual</div>
        <div className="text-xs font-semibold mt-1" style={{ color: accentColor, fontFamily: "'Geist Mono', monospace" }}>
          {formatCurrency(renda)} / mês
        </div>
      </div>
    </div>
  );
}

// ─── Glass Panel ──────────────────────────────────────────────────────────────
function GlassPanel({ children, delay = 0, className = "", colors }: {
  children: React.ReactNode; delay?: number; className?: string; colors: ReturnType<typeof useColors>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`rounded-2xl p-4 md:p-5 ${className}`}
      style={{ background: colors.surface, border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colors = useColors(isDark);

  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  const [activeTab, setActiveTab] = useState<"inputs" | "results">("inputs");

  const { results: fluxoResults, syncValorImovel, registerValorImovelCallback, fluxo, nomeEmpreendimento } = useFluxo();
  const [copied, setCopied] = useState(false);
  const { salvarCenario } = useCenarios();
  const [showSalvarModal, setShowSalvarModal] = useState(false);
  const [nomeCenario, setNomeCenario] = useState("");

  // Decodifica link compartilhado ao montar
  useEffect(() => {
    const payload = decodeShareLink();
    if (payload?.calc) {
      setInputs(payload.calc);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = useCallback(async () => {
    const link = encodeShareLink(inputs, fluxo, nomeEmpreendimento);
    const ok = await copyToClipboard(link);
    if (ok) {
      setCopied(true);
      toast.success("Link copiado!", { description: "Cole o link para compartilhar esta simulação." });
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error("Não foi possível copiar o link.");
    }
  }, [inputs, fluxo, nomeEmpreendimento]);

  // Registra callback para receber atualizações do Fluxo → Calculadora (bidirecional)
  useEffect(() => {
    registerValorImovelCallback((valor: number) => {
      setInputs((prev) => prev.valorImovel === valor ? prev : { ...prev, valorImovel: valor });
    });
  }, [registerValorImovelCallback]);

  // Listener para restaurar cenário do histórico
  useEffect(() => {
    const handler = (e: Event) => {
      const cenario = (e as CustomEvent<Cenario>).detail;
      if (cenario?.inputs) {
        setInputs(cenario.inputs);
        toast.success(`Cenário "${cenario.nome}" restaurado!`);
      }
    };
    window.addEventListener("restaurar-cenario", handler);
    return () => window.removeEventListener("restaurar-cenario", handler);
  }, []);

  // Calculadora → Fluxo (quando o usuário edita na Ficha Técnica)
  useEffect(() => {
    syncValorImovel(inputs.valorImovel);
  }, [inputs.valorImovel, syncValorImovel]);

  const inputsComFluxo = useMemo(() => ({
    ...inputs,
    capitalProprio: (fluxoResults.totalInvestido > 0 ? fluxoResults.totalInvestido : inputs.capitalProprio) + (fluxo.decoracao || 0),
    saldoFinanciar: fluxoResults.financiamento > 0 ? fluxoResults.financiamento : inputs.saldoFinanciar,
  }), [inputs, fluxoResults]);

  const results = useMemo(() => calcular(inputsComFluxo), [inputsComFluxo]);
  const set = useCallback((key: keyof CalculatorInputs) => (value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSalvarCenario = useCallback(() => {
    const nome = nomeCenario.trim() || `Cenário ${new Date().toLocaleDateString("pt-BR")}`;
    salvarCenario(nome, inputsComFluxo, fluxo, {
      rendaMensalLiquida: results.rendaMensalLiquida,
      rentabilidadeAnual: results.rentabilidadeAnual,
      totalInvestido: fluxoResults.totalInvestido > 0 ? fluxoResults.totalInvestido : inputs.capitalProprio,
      financiamento: fluxoResults.financiamento > 0 ? fluxoResults.financiamento : inputs.saldoFinanciar,
      valorImovel: inputs.valorImovel,
    });
    setShowSalvarModal(false);
    setNomeCenario("");
    toast.success(`Cenário "${nome}" salvo!`, { description: "Acesse o histórico para consultar." });
  }, [nomeCenario, salvarCenario, inputsComFluxo, fluxo, results, fluxoResults, inputs]);

  const isPositive = results.rendaMensalLiquida > 0;;
  const rentAccent = results.rentabilidadeAnual >= 15 ? "green" : results.rentabilidadeAnual >= 8 ? "amber" : "red";
  const rentColor = rentAccent === "green" ? colors.green : rentAccent === "amber" ? colors.amber : colors.red;

  const iF = (key: keyof CalculatorInputs) => ({ isDark, colors, value: inputs[key] as number, onChange: set(key) });

  return (
    <div className="w-full" style={{ fontFamily: "'Geist', sans-serif" }}>

      {/* ── HERO ── */}
      <section className="px-4 md:px-6 pt-10 md:pt-16 pb-6 md:pb-10 text-center max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: colors.blueBg, border: `1px solid ${colors.blueBorder}`, color: colors.blue }}>
            <Zap size={11} /> Análise em tempo real
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none mb-4" style={{ color: colors.text1 }}>
            Calcule sua{" "}
            <span style={{ color: colors.blue, textShadow: isDark ? `0 0 40px ${colors.blueGlow}` : "none" }}>
              rentabilidade
            </span>
          </h1>
          <p className="text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-5" style={{ color: colors.text2 }}>
            Simule o retorno do seu imóvel em locação de curta temporada. Análise completa com variantes fiscais e métricas de investimento.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{
                background: copied ? colors.greenBg : colors.blueBg,
                border: `1px solid ${copied ? colors.greenBorder : colors.blueBorder}`,
                color: copied ? colors.green : colors.blue,
              }}
            >
              {copied ? <Check size={12} /> : <Link2 size={12} />}
              {copied ? "Link copiado!" : "Compartilhar simulação"}
            </button>
            <button
              onClick={() => setShowSalvarModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{
                background: isDark ? "oklch(0.72 0.18 145 / 0.1)" : "oklch(0.48 0.2 145 / 0.08)",
                border: `1px solid ${isDark ? "oklch(0.72 0.18 145 / 0.25)" : "oklch(0.48 0.2 145 / 0.2)"}`,
                color: colors.green,
              }}
            >
              <BookmarkPlus size={12} />
              Salvar cenário
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── MODAL SALVAR CENÁRIO ── */}
      <AnimatePresence>
        {showSalvarModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSalvarModal(false)}
              className="fixed inset-0"
              style={{ background: "oklch(0 0 0 / 0.6)", backdropFilter: "blur(6px)", zIndex: 80 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4"
              style={{ zIndex: 90 }}
            >
              <div
                className="rounded-2xl p-6"
                style={{
                  background: isDark ? "oklch(0.11 0.008 240)" : "oklch(1 0 0)",
                  border: `1px solid ${isDark ? "oklch(1 0 0 / 0.08)" : "oklch(0 0 0 / 0.07)"}`,
                  boxShadow: isDark ? "0 24px 64px oklch(0 0 0 / 0.6)" : "0 24px 64px oklch(0 0 0 / 0.15)",
                }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? "oklch(0.72 0.18 145 / 0.12)" : "oklch(0.48 0.2 145 / 0.1)", color: colors.green }}>
                    <BookmarkPlus size={20} />
                  </div>
                  <div>
                    <div className="font-black text-base" style={{ color: colors.text1 }}>Salvar cenário</div>
                    <div className="text-xs" style={{ color: colors.text3 }}>Dê um nome para identificar esta simulação</div>
                  </div>
                </div>
                <input
                  autoFocus
                  type="text"
                  placeholder={`Cenário ${new Date().toLocaleDateString("pt-BR")}`}
                  value={nomeCenario}
                  onChange={(e) => setNomeCenario(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSalvarCenario(); if (e.key === "Escape") setShowSalvarModal(false); }}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-4"
                  style={{
                    background: isDark ? "oklch(0.08 0.005 240)" : "oklch(0.97 0.003 80)",
                    border: `1px solid ${isDark ? "oklch(1 0 0 / 0.1)" : "oklch(0 0 0 / 0.08)"}`,
                    color: colors.text1,
                  }}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSalvarModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-70"
                    style={{ background: isDark ? "oklch(1 0 0 / 0.06)" : "oklch(0 0 0 / 0.05)", color: colors.text2 }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarCenario}
                    className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all hover:opacity-90"
                    style={{ background: colors.green, color: "white" }}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE KPIs ── */}
      <div className="md:hidden px-4 mb-4 grid grid-cols-2 gap-2">
        <MetricCard value={results.rendaMensalLiquida} label="Renda líquida / mês"
          formatter={formatCurrency} icon={<TrendingUp size={14} />} accent="green" size="md" isDark={isDark} colors={colors} />
        <MetricCard value={results.ganhoFinanceiroMensal} label="Rentabilidade / mês s/ capital"
          formatter={(v) => `${formatPercent(v)} a.m.`} icon={<Percent size={14} />} accent={rentAccent as "green"|"amber"|"red"} size="md" isDark={isDark} colors={colors} />
      </div>

      {/* ── MOBILE TABS ── */}
      <div className="md:hidden px-4 mb-4">
        <div className="flex rounded-xl p-1 gap-1" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
          {(["inputs", "results"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
              style={{
                background: activeTab === tab ? colors.blue : "transparent",
                color: activeTab === tab ? "oklch(0.99 0 0)" : colors.text3,
                boxShadow: activeTab === tab && !isDark ? "0 1px 4px oklch(0 0 0 / 0.12)" : "none",
              }}>
              {tab === "inputs" ? "Configurar" : "Resultados"}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8">
        <div className="md:grid md:grid-cols-[380px_1fr] md:gap-5">

          {/* ── LEFT: INPUTS ── */}
          <div className={`space-y-3 ${activeTab === "results" ? "hidden md:block" : ""}`}>

            {/* Ficha Técnica */}
            <GlassPanel delay={0.05} colors={colors}>
              <SectionHeader icon={<Building2 size={13} />} label="Ficha Técnica" colors={colors} />
              <div className="space-y-3">
                <InputField label="Área do imóvel" suffix="m²" min={10} step={1} integer tooltip="Área privativa do imóvel em metros quadrados"
                  {...iF("areaM2")} />
                <InputField label="Valor do imóvel" prefix="R$" min={50000} step={1000} tooltip="Valor de compra ou avaliação do imóvel"
                  {...iF("valorImovel")} />
                <InputField label="Mobília e decoração" prefix="R$" min={0} step={500} tooltip="Custo de mobiliário e decoração (não incluso no valor do imóvel)"
                  {...iF("mobilia")} />
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl p-3" style={{ background: colors.blueBg, border: `1px solid ${colors.blueBorder}` }}>
                    <div className="text-xs mb-1" style={{ color: colors.text3 }}>Valor por m²</div>
                    <div className="text-base font-black" style={{ color: colors.blue, fontFamily: "'Geist Mono', monospace" }}>
                      {formatCurrency(results.valorPorM2)}
                    </div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: colors.blueBg, border: `1px solid ${colors.blueBorder}` }}>
                    <div className="text-xs mb-1" style={{ color: colors.text3 }}>Total da unidade</div>
                    <div className="text-base font-black" style={{ color: colors.blue, fontFamily: "'Geist Mono', monospace" }}>
                      {formatCurrency(results.totalUnidade)}
                    </div>
                  </div>
                </div>
              </div>
            </GlassPanel>

            {/* Ocupação & Receita */}
            <GlassPanel delay={0.1} colors={colors}>
              <SectionHeader icon={<DollarSign size={13} />} label="Ocupação & Receita" colors={colors} />
              <div className="space-y-3">
                <InputField label="Valor da diária" prefix="R$" min={50} step={10} tooltip="Diária média cobrada no Airbnb"
                  {...iF("diaria")} />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium" style={{ color: colors.text3 }}>Dias ocupados / mês</label>
                    <span className="text-sm font-bold" style={{ color: colors.blue, fontFamily: "'Geist Mono', monospace" }}>
                      {inputs.diasOcupacao} dias
                    </span>
                  </div>
                  <Slider min={1} max={30} step={1} value={[inputs.diasOcupacao]} onValueChange={([v]) => set("diasOcupacao")(v)} />
                  <div className="flex justify-between text-xs mt-1" style={{ color: colors.text4 }}>
                    <span>1</span><span>30</span>
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ background: colors.greenBg, border: `1px solid ${colors.greenBorder}` }}>
                  <div className="text-xs mb-1" style={{ color: colors.text3 }}>Receita bruta mensal</div>
                  <div className="text-xl font-black" style={{ color: colors.green, fontFamily: "'Geist Mono', monospace" }}>
                    {formatCurrency(results.receitaBrutaMensal)}
                  </div>
                </div>
              </div>
            </GlassPanel>

            {/* Investimento */}
            <GlassPanel delay={0.15} colors={colors}>
              <SectionHeader icon={<Percent size={13} />} label="Investimento" colors={colors} />
              <div className="space-y-3">
                {fluxoResults.totalInvestido > 0 ? (
                  <div className="rounded-xl p-3" style={{ background: colors.greenBg, border: `1px solid ${colors.greenBorder}` }}>
                    <div className="text-xs mb-1" style={{ color: colors.text3 }}>Capital próprio (via Fluxo)</div>
                    <div className="text-base font-black" style={{ color: colors.green, fontFamily: "'Geist Mono', monospace" }}>
                      {formatCurrency(fluxoResults.totalInvestido)}
                    </div>
                    <div className="text-xs mt-1" style={{ color: colors.text4 }}>Sincronizado do Fluxo de Pagamento</div>
                  </div>
                ) : (
                  <InputField label="Capital próprio" prefix="R$" min={0} step={1000} tooltip="Valor investido do próprio bolso (base do ROI)"
                    {...iF("capitalProprio")} />
                )}
                {fluxoResults.financiamento > 0 ? (
                  <div className="rounded-xl p-3" style={{ background: colors.blueBg, border: `1px solid ${colors.blueBorder}` }}>
                    <div className="text-xs mb-1" style={{ color: colors.text3 }}>Saldo a financiar (via Fluxo)</div>
                    <div className="text-base font-black" style={{ color: colors.blue, fontFamily: "'Geist Mono', monospace" }}>
                      {formatCurrency(fluxoResults.financiamento)}
                    </div>
                  </div>
                ) : (
                  <InputField label="Saldo a financiar" prefix="R$" min={0} step={1000} tooltip="Valor financiado pelo banco"
                    {...iF("saldoFinanciar")} />
                )}
                {/* Taxa anual → converte para mensal internamente */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium" style={{ color: colors.text3 }}>Taxa de juros anual</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info size={11} className="cursor-help" style={{ color: colors.text4 }} />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-48 text-xs">
                        Digite a taxa anual. A taxa mensal equivalente é calculada automaticamente.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center rounded-xl transition-all duration-200 flex-1"
                      style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, boxShadow: colors.inputShadow }}
                    >
                      <input
                        type="text" inputMode="decimal"
                        value={(() => { const aa = inputs.taxaJurosMensal * 100 * 12; return aa % 1 === 0 ? aa.toFixed(0) : aa.toFixed(2); })()}
                        onChange={(e) => {
                          const aa = parseFloat(e.target.value.replace(",", "."));
                          if (!isNaN(aa) && aa > 0) set("taxaJurosMensal")(aa / 100 / 12);
                        }}
                        className="flex-1 bg-transparent px-3 py-3 text-sm font-medium outline-none min-w-0"
                        style={{ color: colors.mono, fontFamily: "'Geist Mono', monospace" }}
                      />
                      <span className="pr-3 text-xs select-none" style={{ color: colors.text3 }}>% a.a.</span>
                    </div>
                  </div>
                  <div className="mt-1.5 text-xs" style={{ color: colors.text4 }}>
                    Equivalente: <span style={{ color: colors.blue, fontFamily: "'Geist Mono', monospace" }}>
                      {(inputs.taxaJurosMensal * 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}% a.m.
                    </span>
                  </div>
                </div>
                <InputField label="Prazo" suffix="meses" min={12} step={12} integer tooltip="Prazo total do financiamento em meses"
                  {...iF("prazoMeses")} />
                <div className="rounded-xl p-3" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
                  <div className="text-xs mb-1" style={{ color: colors.text3 }}>Parcela mensal (Price)</div>
                  <div className="text-base font-black" style={{ color: colors.blue, fontFamily: "'Geist Mono', monospace" }}>
                    {formatCurrency(results.parcelaFinanciamento)}
                  </div>
                </div>
              </div>
            </GlassPanel>

            {/* Custos Fixos */}
            <GlassPanel delay={0.2} colors={colors}>
              <SectionHeader icon={<Home size={13} />} label="Custos Fixos Mensais" colors={colors} />
              <div className="space-y-3">
                <InputField label="Condomínio" prefix="R$" min={0} step={50} {...iF("condominio")} isDark={isDark} colors={colors} />
                <InputField label="IPTU" prefix="R$" min={0} step={10} tooltip="Valor mensal do IPTU (total anual ÷ 12)" {...iF("iptuMensal")} isDark={isDark} colors={colors} />
                <div className="grid grid-cols-3 gap-2">
                  <InputField label="Wi-Fi" prefix="R$" min={0} step={10} icon={<Wifi size={11} />} {...iF("wifi")} isDark={isDark} colors={colors} />
                  <InputField label="Água" prefix="R$" min={0} step={10} icon={<Droplets size={11} />} {...iF("agua")} isDark={isDark} colors={colors} />
                  <InputField label="Luz" prefix="R$" min={0} step={10} icon={<Bolt size={11} />} {...iF("luz")} isDark={isDark} colors={colors} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium" style={{ color: colors.text3 }}>Administração + Seguro</label>
                    <span className="text-xs font-bold" style={{ color: colors.blue, fontFamily: "'Geist Mono', monospace" }}>
                      {(inputs.taxaAdminSeguro * 100).toFixed(0)}% da receita
                    </span>
                  </div>
                  <Slider min={0} max={0.2} step={0.01} value={[inputs.taxaAdminSeguro]} onValueChange={([v]) => set("taxaAdminSeguro")(v)} />
                  <div className="flex justify-between text-xs mt-1" style={{ color: colors.text4 }}>
                    <span>0%</span><span>20%</span>
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
                  <div className="text-xs mb-1" style={{ color: colors.text3 }}>Total custos fixos</div>
                  <div className="text-base font-black" style={{ color: colors.red, fontFamily: "'Geist Mono', monospace" }}>
                    {formatCurrency(results.totalDespesas)}
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* ── RIGHT: RESULTS ── */}
          <div className={`space-y-3 ${activeTab === "inputs" ? "hidden md:block" : ""}`}>

            {/* KPI Grid — desktop only */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard value={results.rendaMensalLiquida} label="Renda líquida / mês"
                formatter={formatCurrency} icon={<TrendingUp size={14} />} accent="green" size="lg" isDark={isDark} colors={colors} />
              <MetricCard value={results.ganhoFinanceiroMensal} label="Rentabilidade / mês s/ capital"
                formatter={(v) => `${formatPercent(v)} a.m.`} icon={<Percent size={14} />} accent={rentAccent as "green"|"amber"|"red"} size="lg" isDark={isDark} colors={colors} />
              <MetricCard value={results.receitaBrutaMensal} label="Receita bruta / mês"
                formatter={formatCurrency} icon={<DollarSign size={14} />} accent="blue" isDark={isDark} colors={colors} />
              <MetricCard value={results.totalDespesas} label="Total de despesas"
                formatter={formatCurrency} icon={<Minus size={14} />} accent="red" isDark={isDark} colors={colors} />
            </div>

            {/* Composição da renda */}
            <GlassPanel delay={0.1} colors={colors}>
              <SectionHeader icon={<BarChart3 size={13} />} label="Composição da Renda" colors={colors} />
              <div className="space-y-2">
                {/* Ordem: Renda liquida (topo) -> custos de baixo para cima -> Receita bruta (base) */}
                <WaterfallBar label="Renda líquida" value={results.rendaMensalLiquida} total={results.receitaBrutaMensal}
                  color={isPositive ? colors.green : colors.red} colors={colors} />
                <div className="h-px my-2" style={{ background: colors.divider }} />
                <WaterfallBar label="Financiamento" value={results.parcelaFinanciamento} total={results.receitaBrutaMensal} color={colors.amber} isNegative colors={colors} />
                <WaterfallBar label="Adm + Seguro" value={results.adminSeguro} total={results.receitaBrutaMensal} color={colors.amber} isNegative colors={colors} />
                <WaterfallBar label="Wi-Fi/Água/Luz" value={inputs.wifi + inputs.agua + inputs.luz} total={results.receitaBrutaMensal} color={colors.red} isNegative colors={colors} />
                <WaterfallBar label="IPTU" value={inputs.iptuMensal} total={results.receitaBrutaMensal} color={colors.red} isNegative colors={colors} />
                <WaterfallBar label="Condomínio" value={inputs.condominio} total={results.receitaBrutaMensal} color={colors.red} isNegative colors={colors} />
                <WaterfallBar label="Receita bruta" value={results.receitaBrutaMensal} total={results.receitaBrutaMensal} color={colors.blue} colors={colors} />
              </div>
            </GlassPanel>

            {/* Variantes fiscais */}
            <GlassPanel delay={0.15} colors={colors}>
              <SectionHeader icon={<Shield size={13} />} label="Variantes Fiscais" colors={colors} />
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <FiscalCard label="Lucro" renda={results.rendaMensalLiquida}
                  rentabilidade={results.rentabilidadeAnual} icon={<DollarSign size={13} />}
                  accent="blue" isHighlight isDark={isDark} colors={colors} />
                <FiscalCard label="Holding" renda={results.rendaHolding}
                  rentabilidade={results.rentabilidadeHoldingAnual} icon={<Shield size={13} />}
                  accent="green" isDark={isDark} colors={colors} />
                <FiscalCard label="PF" renda={results.rendaPF}
                  rentabilidade={results.rentabilidadePFAnual} icon={<User size={13} />}
                  accent="amber" isDark={isDark} colors={colors} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs" style={{ color: colors.text4 }}>
                <div className="rounded-lg px-3 py-2" style={{ background: colors.inputBg }}>
                  <span style={{ color: colors.green }}>Holding</span>: desconto de 9% sobre renda bruta
                </div>
                <div className="rounded-lg px-3 py-2" style={{ background: colors.inputBg }}>
                  <span style={{ color: colors.amber }}>PF</span>: desconto de 27% sobre renda bruta
                </div>
              </div>
            </GlassPanel>

            {/* Breakeven + Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <GlassPanel delay={0.2} colors={colors}>
                <SectionHeader icon={<Calculator size={13} />} label="Breakeven" colors={colors} />
                <div className="mb-3">
                  <div className="text-xs mb-1" style={{ color: colors.text3 }}>Dias mínimos p/ cobrir despesas</div>
                  <div className="text-3xl font-black" style={{
                    color: results.diasBreakeven <= inputs.diasOcupacao ? colors.green : colors.red,
                    fontFamily: "'Geist', sans-serif",
                  }}>
                    {results.diasBreakeven} dias
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "Ocupação atual", days: inputs.diasOcupacao, color: colors.blue },
                    { label: "Breakeven", days: results.diasBreakeven, color: colors.red },
                  ].map(({ label, days, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: colors.text3 }}>{label}</span>
                        <span style={{ color, fontFamily: "'Geist Mono', monospace" }}>{days} dias ({((days / 30) * 100).toFixed(0)}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: colors.inputBg }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${Math.min((days / 30) * 100, 100)}%` }}
                          transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>

              <GlassPanel delay={0.25} colors={colors}>
                <SectionHeader icon={<Calculator size={13} />} label="Resumo" colors={colors} />
                <div className="space-y-1.5">
                  {[
                    { label: "Receita bruta", value: results.receitaBrutaMensal, color: colors.blue },
                    { label: "Total despesas", value: -results.totalDespesas, color: colors.red },
                    { label: "Renda líquida", value: results.rendaMensalLiquida, color: isPositive ? colors.green : colors.red, bold: true },
                  ].map(({ label, value, color, bold }) => (
                    <div key={label} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${colors.divider}` }}>
                      <span className={`text-xs ${bold ? "font-semibold" : ""}`} style={{ color: bold ? colors.text2 : colors.text3 }}>{label}</span>
                      <span className={`text-sm ${bold ? "font-black" : "font-semibold"}`} style={{ color, fontFamily: "'Geist Mono', monospace" }}>
                        {value < 0 ? "−" : ""}{formatCurrency(Math.abs(value))}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: colors.text3 }}>Rentabilidade mensal s/ capital investido</span>
                      <span className="text-sm font-bold" style={{ color: colors.blue, fontFamily: "'Geist Mono', monospace" }}>
                        {formatPercent(results.ganhoFinanceiroMensal)} a.m.
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color: colors.text2 }}>Rentabilidade anual</span>
                      <span className="text-base font-black" style={{ color: rentColor, fontFamily: "'Geist Mono', monospace" }}>
                        {formatPercent(results.rentabilidadeAnual)} a.a.
                      </span>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </div>

            {/* Breakeven do Total Investido */}
            {(() => {
              // Decoracao soma ao total investido no breakeven (custo de setup do imovel)
              const totalInv = (fluxoResults.totalInvestido > 0 ? fluxoResults.totalInvestido : inputs.capitalProprio) + (fluxo.decoracao || 0);
              const rendaLiq = results.rendaMensalLiquida;
              const mesesParaBreakeven = rendaLiq > 0 ? Math.ceil(totalInv / rendaLiq) : null;
              const anos = mesesParaBreakeven !== null ? Math.floor(mesesParaBreakeven / 12) : null;
              const mesesRest = mesesParaBreakeven !== null ? mesesParaBreakeven % 12 : null;
              const progressPct = mesesParaBreakeven !== null ? Math.min((12 / mesesParaBreakeven) * 100, 100) : 0;
              return (
                <GlassPanel delay={0.3} colors={colors}>
                  <SectionHeader icon={<TrendingUp size={13} />} label="Breakeven do Investimento" colors={colors} />
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-1">
                      <div className="text-xs mb-1" style={{ color: colors.text3 }}>Tempo para recuperar o capital investido</div>
                      {mesesParaBreakeven !== null ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black" style={{ color: colors.green, fontFamily: "'Geist', sans-serif" }}>
                            {anos}a {mesesRest}m
                          </span>
                          <span className="text-xs" style={{ color: colors.text3 }}>({mesesParaBreakeven} meses)</span>
                        </div>
                      ) : (
                        <div className="text-2xl font-black" style={{ color: colors.red }}>Renda negativa</div>
                      )}
                      <div className="text-xs mt-1" style={{ color: colors.text4 }}>
                        Base: {formatCurrency(totalInv)} investidos{fluxo.decoracao > 0 ? ` (incl. R$ ${fluxo.decoracao.toLocaleString('pt-BR')} decoracao)` : ''} ÷ {formatCurrency(rendaLiq)}/mês
                      </div>
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span style={{ color: colors.text3 }}>Progresso anual estimado</span>
                        <span style={{ color: colors.green, fontFamily: "'Geist Mono', monospace" }}>{progressPct.toFixed(1)}% / ano</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: colors.inputBg }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${colors.blue}, ${colors.green})` }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {[
                          { label: "Lucro", meses: mesesParaBreakeven, color: colors.text2 },
                          { label: "Holding (−9%)", meses: mesesParaBreakeven !== null ? Math.ceil(totalInv / (rendaLiq * 0.91)) : null, color: colors.blue },
                          { label: "PF (−27%)", meses: mesesParaBreakeven !== null ? Math.ceil(totalInv / (rendaLiq * 0.73)) : null, color: colors.amber },
                        ].map(({ label, meses, color }) => (
                          <div key={label} className="text-center p-2 rounded-xl" style={{ background: colors.inputBg }}>
                            <div className="text-xs mb-0.5" style={{ color: colors.text4 }}>{label}</div>
                            {meses !== null ? (
                              <>
                                <div className="text-sm font-black" style={{ color, fontFamily: "'Geist Mono', monospace" }}>
                                  {Math.floor(meses / 12)}a {meses % 12}m
                                </div>
                              </>
                            ) : (
                              <div className="text-xs font-bold" style={{ color: colors.red }}>—</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              );
            })()}
          </div>
        </div>
      </div>
      {/* FOOTER */}
      <footer className="py-6 px-4 text-center" style={{ borderTop: `1px solid ${colors.divider}` }}>
        <p className="text-xs" style={{ color: colors.text4 }}>
          Calculadora de rentabilidade para locacao de curta temporada. Os valores sao estimativas e nao constituem assessoria financeira.
        </p>
      </footer>
    </div>
  );
}
