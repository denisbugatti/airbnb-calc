/**
 * Home.tsx — Calculadora de Rentabilidade Short Stay
 * Dual theme: Dark Cosmos / Slate Premium
 * Cores adaptativas via useTheme() — sem oklch hardcoded
 */

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ReferenceLine, Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  calcular,
  formatCurrency,
  formatPercent,
  defaultInputs,
  type CalculatorInputs,
} from "@/lib/calculator";
import { useFluxo } from "@/contexts/FluxoContext";
import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Building2, TrendingUp, DollarSign, Percent,
  ChevronDown, ChevronUp, Info, Home, Zap, BarChart3,
  Shield, User, Minus, Calculator, Wifi, Droplets, Bolt,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { decodeShareLink } from "@/lib/shareLink";
import { QuadroRentabilidade } from "@/components/QuadroRentabilidade";
import { MobileSummaryBar } from "@/components/MobileSummaryBar";
import { BookmarkPlus } from "lucide-react";
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
    // rAF não roda em abas em segundo plano — garante o valor final mesmo sem frames
    const snap = setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      prevRef.current = end;
      setDisplayed(end);
    }, duration + 100);
    return () => { cancelAnimationFrame(rafRef.current); clearTimeout(snap); };
  }, [value, duration]);
  return displayed;
}

// ─── Theme-aware color tokens (paleta Vitacon compartilhada) ─────────────────
import { useVitaconColors as useColors } from "@/lib/vitaconColors";

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
  const displayValue = formatThousands(value);
  // Sincroniza valor externo no input apenas quando NAO está focado
  // (evita reset durante digitação, que limitava a apenas 1 dígito por vez).
  useEffect(() => {
    if (!focused && inputRef.current) {
      inputRef.current.value = formatThousands(value);
    }
  }, [value, focused]);
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
        {prefix && <span className="pl-2.5 text-xs font-medium select-none" style={{ color: colors.text3 }}>{prefix}</span>}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          defaultValue={displayValue}
          placeholder="0"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent px-2 py-3 text-sm font-medium outline-none min-w-0 w-full"
          style={{ color: colors.mono, fontFamily: "var(--font-mono)" }}
          autoComplete="off"
        />
        {suffix && <span className="pr-2 text-xs select-none" style={{ color: colors.text3 }}>{suffix}</span>}
        <div className="flex flex-col border-l shrink-0" style={{ borderColor: colors.divider }}>
          <button onClick={() => { const v = Math.max(min, value + step); onChange(v); }} className="px-1.5 py-2 transition-colors rounded-tr-xl" style={{ color: colors.text3 }}>
            <ChevronUp size={12} />
          </button>
          <button onClick={() => { const v = Math.max(min, value - step); onChange(v); }} className="px-1.5 py-2 transition-colors rounded-br-xl" style={{ color: colors.text3 }}>
            <ChevronDown size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Estados vazios ───────────────────────────────────────────────────────────
const DASH = "—";

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ value, label, formatter, icon, accent, size = "md", isDark, colors, valido = true }: {
  value: number; label: string; formatter: (v: number) => string;
  icon: React.ReactNode; accent: "blue" | "green" | "amber" | "red";
  size?: "md" | "lg"; isDark: boolean; colors: ReturnType<typeof useColors>; valido?: boolean;
}) {
  const animated = useAnimatedNumber(value);
  const accentColor = colors[accent as keyof typeof colors] as string;
  const accentGlow = colors[`${accent}Glow` as keyof typeof colors] as string;
  const accentIconBg = colors[`${accent}IconBg` as keyof typeof colors] as string;
  const accentBorder = colors[`${accent}Border` as keyof typeof colors] as string;
  const accentBg = colors[`${accent}Bg` as keyof typeof colors] as string;
  void accentGlow;
  return (
    <div
      className="rounded-2xl p-3 md:p-4 flex flex-col gap-1.5"
      style={{
        background: accentBg,
        border: `1px solid ${accentBorder}`,
        boxShadow: colors.cardShadow,
      }}
    >
      <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: accentIconBg, color: accentColor }}>
        {icon}
      </div>
      <div className={`tracking-tight ${size === "lg" ? "text-2xl md:text-3xl" : "text-xl"}`}
        style={{ color: valido ? accentColor : colors.text4, fontFamily: "var(--font-display)", fontWeight: 700 }}>
        {valido ? formatter(animated) : DASH}
      </div>
      <div className="text-xs mt-0.5 font-medium" style={{ color: colors.text3 }}>{label}</div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, label, colors }: { icon: React.ReactNode; label: string; colors: ReturnType<typeof useColors> }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: colors.blueIconBg, color: colors.blue }}>{icon}</div>
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: colors.blue, fontFamily: "var(--font-display)" }}>{label}</span>
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
        <span className="text-xs font-semibold" style={{ color: isNegative ? colors.red : color, fontFamily: "var(--font-mono)" }}>
          {isNegative ? "−" : ""}{formatCurrency(Math.abs(value))}
        </span>
      </div>
    </div>
  );
}

// ─── Fiscal Card ──────────────────────────────────────────────────────────────
function FiscalCard({ label, renda, rentabilidade, receitaBruta, icon, accent, isHighlight = false, isDark, colors, valido = true, validoPct = true }: {
  label: string; renda: number; rentabilidade: number; receitaBruta: number;
  icon: React.ReactNode; accent: "blue" | "green" | "amber"; isHighlight?: boolean;
  isDark: boolean; colors: ReturnType<typeof useColors>; valido?: boolean; validoPct?: boolean;
}) {
  const accentColor = colors[accent as keyof typeof colors] as string;
  const accentGlow = colors[`${accent}Glow` as keyof typeof colors] as string;
  const accentBorder = colors[`${accent}Border` as keyof typeof colors] as string;
  const accentBg = colors[`${accent}Bg` as keyof typeof colors] as string;
  const accentIconBg = colors[`${accent}IconBg` as keyof typeof colors] as string;
  const animRenda = useAnimatedNumber(renda);
  const animRent = useAnimatedNumber(rentabilidade);
  const rentMensal = rentabilidade / 12;
  const animRentMensal = useAnimatedNumber(rentMensal);
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
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: accentIconBg, color: accentColor }}>{icon}</div>
        <span className="text-xs font-bold tracking-wider uppercase" style={{ color: accentColor }}>{label}</span>
      </div>
      {/* Receita Bruta — topo */}
      <div>
        <div className="text-xs font-medium" style={{ color: colors.text4 }}>Receita bruta</div>
        <div className="text-sm font-bold" style={{ color: colors.text2, fontFamily: "var(--font-mono)" }}>
          {valido ? formatCurrency(receitaBruta) : DASH}
        </div>
      </div>
      {/* Renda Líquida (mensal + anual) */}
      <div>
        <div className="text-xs font-medium" style={{ color: colors.text4 }}>Renda líquida / mês</div>
        <div className="text-lg md:text-2xl" style={{ color: valido ? accentColor : colors.text4, fontFamily: "var(--font-display)", fontWeight: 700, textShadow: isDark && valido ? `0 0 20px ${accentGlow}` : "none" }}>
          {valido ? formatCurrency(animRenda) : DASH}
        </div>
        <div className="text-xs font-medium mt-1.5" style={{ color: colors.text4 }}>Renda líquida / ano</div>
        <div className="text-sm md:text-base font-bold" style={{ color: colors.text2, fontFamily: "var(--font-mono)" }}>
          {valido ? formatCurrency(animRenda * 12) : DASH}
        </div>
      </div>
      {/* Rentabilidade Mensal + Anual */}
      <div className="pt-2 border-t grid grid-cols-2 gap-2" style={{ borderColor: colors.divider }}>
        <div>
          <div className="text-base font-bold" style={{ color: validoPct ? accentColor : colors.text4, fontFamily: "var(--font-mono)" }}>
            {validoPct ? `${formatPercent(animRentMensal)} a.m.` : DASH}
          </div>
          <div className="text-xs mt-0.5" style={{ color: colors.text3 }}>rent. mensal</div>
        </div>
        <div>
          <div className="text-base font-bold" style={{ color: validoPct ? accentColor : colors.text4, fontFamily: "var(--font-mono)" }}>
            {validoPct ? `${formatPercent(animRent)} a.a.` : DASH}
          </div>
          <div className="text-xs mt-0.5" style={{ color: colors.text3 }}>rent. anual</div>
        </div>
      </div>
    </div>
  );
}

// ─── Glass Panel ──────────────────────────────────────────────────────────────
function GlassPanel({ children, delay: _delay = 0, className = "", colors }: {
  children: React.ReactNode; delay?: number; className?: string; colors: ReturnType<typeof useColors>;
}) {
  return (
    <div
      className={`rounded-2xl p-4 md:p-5 ${className}`}
      style={{ background: colors.surface, border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}
    >
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colors = useColors(isDark);

  const [activeTab, setActiveTab] = useState<"inputs" | "results">("inputs");

  const { results: fluxoResults, calc, setCalc, setCalcField, fluxo, nomeEmpreendimento, syncValorImovelParaCalc } = useFluxo();
  const inputs = calc;  // alias para compatibilidade com código existente
  const { salvarCenario } = useCenarios();
  const [showSalvarModal, setShowSalvarModal] = useState(false);
  const [nomeCenario, setNomeCenario] = useState("");

  // SEO: define título da página com 30-60 caracteres
  useEffect(() => {
    document.title = "Calculadora de Rentabilidade Airbnb | Vitacon";
    // Meta keywords
    let meta = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "keywords";
      document.head.appendChild(meta);
    }
    meta.content = "calculadora rentabilidade airbnb, short stay, locação curta temporada, ROI imóvel, simulador aluguel, holding imobiliária, rentabilidade imobiliária";
    return () => { document.title = "Vitacon — Calculadora de Rentabilidade"; };
  }, []);

  // Decodifica link compartilhado ao montar
  useEffect(() => {
    const payload = decodeShareLink();
    if (payload?.calc) {
      // Merge com defaults: links antigos não têm os campos novos (impostos editáveis)
      setCalc(() => ({ ...defaultInputs, ...payload.calc }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // registerCalcCallback removido — calc é a fonte única compartilhada via FluxoContext

  // Listener para restaurar cenário do histórico
  useEffect(() => {
    const handler = (e: Event) => {
      const cenario = (e as CustomEvent<Cenario>).detail;
      if (cenario?.inputs) {
        // Merge com defaults: cenários salvos antes dos impostos editáveis não têm os campos novos
        setCalc(() => ({ ...defaultInputs, ...cenario.inputs }));
        toast.success(`Cenário "${cenario.nome}" restaurado!`);
      }
    };
    window.addEventListener("restaurar-cenario", handler);
    return () => window.removeEventListener("restaurar-cenario", handler);
  }, []);

  // Sync removido — calc é a fonte única compartilhada via FluxoContext

  const inputsComFluxo = useMemo(() => ({
    ...inputs,
    // O Fluxo de Pagamento é a fonte única: capital próprio e saldo vêm sempre dele
    // (a mobília é somada dentro do motor de cálculo)
    capitalProprio: fluxoResults.totalInvestido,
    saldoFinanciar: fluxoResults.financiamento,
  }), [inputs, fluxoResults]);

  const results = useMemo(() => calcular(inputsComFluxo), [inputsComFluxo]);
  const set = useCallback((key: keyof CalculatorInputs) => (value: number) => {
    setCalcField(key, value);
  }, [setCalcField]);

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
    <div className="w-full" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── HERO — capa do Style Guide: preto absoluto + display azul + grafismo V ── */}
      <section className="relative overflow-hidden" style={{ background: "#000000" }}>
        {/* Grafismo do V em linhas (traço que se desenha) */}
        <svg
          className="absolute inset-y-0 right-0 h-full w-auto hidden sm:block"
          viewBox="0 0 520 420"
          fill="none"
          aria-hidden="true"
          style={{ pointerEvents: "none" }}
        >
          <path className="v-line" d="M270 -40 L440 460 L620 -60" stroke="#2800FF" strokeWidth="3" />
          <path className="v-line" d="M150 -60 L300 380 L460 -80" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" style={{ animationDelay: "450ms" }} />
        </svg>
        <div className="relative px-4 md:px-6 pt-10 md:pt-14 pb-9 md:pb-12 max-w-7xl mx-auto">
          <div className="wipe inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.25em] uppercase mb-6"
            style={{ color: "#898A8E", fontFamily: "var(--font-mono)" }}>
            <Zap size={11} style={{ color: "#5A43FF" }} /> Análise em tempo real
          </div>
          {/* H2 visível para SEO — descreve a seção principal */}
          <h2 className="sr-only">Simulador de Rentabilidade para Locação de Curta Temporada</h2>
          <h1 className="uppercase tracking-tight" style={{ fontFamily: "var(--font-display)", fontWeight: 700, lineHeight: 0.98 }}>
            <span className="wipe block text-4xl sm:text-5xl md:text-7xl" style={{ color: "#FFFFFF" }}>Calcule sua</span>
            <span className="wipe wipe-2 block text-4xl sm:text-5xl md:text-7xl" style={{ color: "#2800FF" }}>rentabilidade</span>
          </h1>
          <p className="rise rise-3 mt-5 text-sm md:text-base leading-relaxed max-w-xl" style={{ color: "#B3B3B3" }}>
            Simule o retorno do seu imóvel em locação de curta temporada. Análise completa com variantes fiscais e métricas de investimento.
          </p>
          <div className="rise rise-4 mt-7">
            <button
              onClick={() => setShowSalvarModal(true)}
              className="press inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold"
              style={{ background: "#2800FF", color: "#FFFFFF", fontFamily: "var(--font-sans)" }}
            >
              <BookmarkPlus size={12} />
              Salvar cenário
            </button>
          </div>
        </div>
      </section>

      {/* ── MODAL SALVAR CENÁRIO ── */}
      <AnimatePresence>
        {showSalvarModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSalvarModal(false)}
              className="fixed inset-0"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", zIndex: 80 }}
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
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.6)" : "0 24px 64px rgba(10,10,11,0.15)",
                }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: colors.blueIconBg, color: colors.blue }}>
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
                    background: colors.inputBg,
                    border: `1px solid ${colors.border}`,
                    color: colors.text1,
                  }}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSalvarModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-70"
                    style={{ background: colors.inputBg, color: colors.text2 }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarCenario}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: colors.blue, color: "white" }}
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
        <MetricCard value={results.rendaMensalLiquida} label="Renda líquida / mês" valido={results.temReceita}
          formatter={formatCurrency} icon={<TrendingUp size={14} />} accent="green" size="md" isDark={isDark} colors={colors} />
        <MetricCard value={results.ganhoFinanceiroMensal} label="Rentabilidade / mês s/ capital" valido={results.temReceita && results.temBaseCapital}
          formatter={(v) => `${formatPercent(v)} a.m.`} icon={<Percent size={14} />} accent={rentAccent as "green"|"amber"|"red"} size="md" isDark={isDark} colors={colors} />
      </div>

      {/* ── MOBILE TABS ── */}
      <div className="md:hidden px-4 mb-4">
        <div className="flex rounded-xl p-1 gap-1" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
          {(["inputs", "results"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="press flex-1 py-2 text-xs font-semibold rounded-lg"
              style={{
                background: activeTab === tab ? colors.blue : "transparent",
                color: activeTab === tab ? "#FFFFFF" : colors.text3,
                boxShadow: activeTab === tab && !isDark ? "0 1px 4px rgba(10,10,11,0.12)" : "none",
              }}>
              {tab === "inputs" ? "Configurar" : "Resultados"}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-8">
        <div className="md:grid md:grid-cols-[380px_1fr] md:gap-5">

          {/* ── LEFT: INPUTS ── */}
          <div className={`space-y-3 ${activeTab === "results" ? "hidden md:block" : ""}`}>

            {/* Ficha Técnica */}
            <GlassPanel delay={0.05} colors={colors}>
              <SectionHeader icon={<Building2 size={13} />} label="Ficha Técnica" colors={colors} />
              <div className="space-y-3">
                <InputField label="Área do imóvel" suffix="m²" min={10} step={1} integer tooltip="Área privativa do imóvel em metros quadrados"
                  {...iF("areaM2")} />
                <InputField label="Valor do imóvel" prefix="R$" min={0} step={1000} tooltip="Valor de compra ou avaliação do imóvel — atualiza o Fluxo de Pagamento automaticamente"
                  isDark={isDark} colors={colors} value={inputs.valorImovel}
                  onChange={(v) => syncValorImovelParaCalc(v)} />
                <InputField label="Mobília e decoração" prefix="R$" min={0} step={500} tooltip="Custo de mobiliário e decoração (não incluso no valor do imóvel)"
                  {...iF("mobilia")} />
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl p-3" style={{ background: colors.blueBg, border: `1px solid ${colors.blueBorder}` }}>
                    <div className="text-xs mb-1" style={{ color: colors.text3 }}>Valor por m²</div>
                    <div className="text-base font-black" style={{ color: colors.blue, fontFamily: "var(--font-mono)" }}>
                      {formatCurrency(results.valorPorM2)}
                    </div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: colors.blueBg, border: `1px solid ${colors.blueBorder}` }}>
                    <div className="text-xs mb-1" style={{ color: colors.text3 }}>Total da unidade</div>
                    <div className="text-base font-black" style={{ color: colors.blue, fontFamily: "var(--font-mono)" }}>
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
                    <span className="text-sm font-bold" style={{ color: colors.blue, fontFamily: "var(--font-mono)" }}>
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
                  <div className="text-xl font-black" style={{ color: colors.green, fontFamily: "var(--font-mono)" }}>
                    {formatCurrency(results.receitaBrutaMensal)}
                  </div>
                </div>
              </div>
            </GlassPanel>

            {/* Investimento */}
            <GlassPanel delay={0.15} colors={colors}>
              <SectionHeader icon={<Percent size={13} />} label="Investimento" colors={colors} />
              <div className="space-y-3">
                {/* Fonte única: Fluxo de Pagamento */}
                <div className="rounded-xl p-3" style={{ background: colors.greenBg, border: `1px solid ${colors.greenBorder}` }}>
                  <div className="text-xs mb-1" style={{ color: colors.text3 }}>Capital próprio total (via Fluxo)</div>
                  <div className="text-base font-black" style={{ color: colors.green, fontFamily: "var(--font-mono)" }}>
                    {formatCurrency(results.capitalProprioTotal)}
                  </div>
                  <div className="text-xs mt-1" style={{ color: colors.text4 }}>
                    Soma das séries + decoração — base do retorno
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ background: colors.blueBg, border: `1px solid ${colors.blueBorder}` }}>
                  <div className="text-xs mb-1" style={{ color: colors.text3 }}>Saldo a financiar (via Fluxo)</div>
                  <div className="text-base font-black" style={{ color: colors.blue, fontFamily: "var(--font-mono)" }}>
                    {formatCurrency(fluxoResults.financiamento)}
                  </div>
                </div>
                <Link href="/fluxo">
                  <div className="press cursor-pointer rounded-xl px-3 py-2.5 text-xs font-semibold text-center"
                    style={{ background: colors.blueBg, border: `1px solid ${colors.blueBorder}`, color: colors.blue }}>
                    Configurar no Fluxo de Pagamento →
                  </div>
                </Link>
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
                        style={{ color: colors.mono, fontFamily: "var(--font-mono)" }}
                      />
                      <span className="pr-3 text-xs select-none" style={{ color: colors.text3 }}>% a.a.</span>
                    </div>
                  </div>
                  <div className="mt-1.5 text-xs" style={{ color: colors.text4 }}>
                    Equivalente: <span style={{ color: colors.blue, fontFamily: "var(--font-mono)" }}>
                      {(inputs.taxaJurosMensal * 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}% a.m.
                    </span>
                  </div>
                </div>
                <InputField label="Prazo" suffix="meses" min={12} step={12} integer tooltip="Prazo total do financiamento em meses"
                  {...iF("prazoMeses")} />
                <div className="rounded-xl p-3" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
                  <div className="text-xs mb-1" style={{ color: colors.text3 }}>Parcela mensal (Price)</div>
                  <div className="text-base font-black" style={{ color: colors.blue, fontFamily: "var(--font-mono)" }}>
                    {formatCurrency(results.parcelaFinanciamento)}
                  </div>
                </div>
              </div>
            </GlassPanel>

            {/* Custos Fixos */}
            <GlassPanel delay={0.2} colors={colors}>
              <SectionHeader icon={<Home size={13} />} label="Custos Fixos Mensais" colors={colors} />
              <div className="space-y-3">
                {/* Financiamento */}
                <div className="rounded-xl p-3" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
                  <div className="text-xs mb-1" style={{ color: colors.text3 }}>Parcela mensal (Financiamento)</div>
                  <div className="text-base font-black" style={{ color: colors.amber, fontFamily: "var(--font-mono)" }}>
                    {formatCurrency(results.parcelaFinanciamento)}
                  </div>
                </div>
                {/* Adm + Seguro */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium" style={{ color: colors.text3 }}>Administração + Seguro</label>
                    <span className="text-xs font-bold" style={{ color: colors.blue, fontFamily: "var(--font-mono)" }}>
                      {(inputs.taxaAdminSeguro * 100).toFixed(0)}% da receita
                    </span>
                  </div>
                  <Slider min={0} max={0.2} step={0.01} value={[inputs.taxaAdminSeguro]} onValueChange={([v]) => set("taxaAdminSeguro")(v)} />
                  <div className="flex justify-between text-xs mt-1" style={{ color: colors.text4 }}>
                    <span>0%</span><span>20%</span>
                  </div>
                </div>
                {/* Wi-Fi / Água / Luz */}
                <div className="grid grid-cols-3 gap-2">
                  <InputField label="Wi-Fi" prefix="R$" min={0} step={10} icon={<Wifi size={11} />} {...iF("wifi")} isDark={isDark} colors={colors} />
                  <InputField label="Água" prefix="R$" min={0} step={10} icon={<Droplets size={11} />} {...iF("agua")} isDark={isDark} colors={colors} />
                  <InputField label="Luz" prefix="R$" min={0} step={10} icon={<Bolt size={11} />} {...iF("luz")} isDark={isDark} colors={colors} />
                </div>
                {/* IPTU */}
                <InputField label="IPTU" prefix="R$" min={0} step={10} tooltip="Valor mensal do IPTU (total anual ÷ 12)" {...iF("iptuMensal")} isDark={isDark} colors={colors} />
                {/* Condomínio */}
                <InputField label="Condomínio" prefix="R$" min={0} step={50} {...iF("condominio")} isDark={isDark} colors={colors} />

              </div>
            </GlassPanel>

            {/* Impostos (variantes fiscais) */}
            <GlassPanel delay={0.22} colors={colors}>
              <SectionHeader icon={<Shield size={13} />} label="Impostos" colors={colors} />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Holding" suffix="%" min={0} step={1} integer
                  tooltip="Imposto sobre a renda líquida na estrutura de holding (padrão 9%)"
                  isDark={isDark} colors={colors}
                  value={Math.round(inputs.impostoHolding * 100)}
                  onChange={(v) => set("impostoHolding")(Math.min(100, v) / 100)} />
                <InputField label="Pessoa Física" suffix="%" min={0} step={1} integer
                  tooltip="Imposto de renda sobre aluguel como pessoa física (padrão 27%)"
                  isDark={isDark} colors={colors}
                  value={Math.round(inputs.impostoPF * 100)}
                  onChange={(v) => set("impostoPF")(Math.min(100, v) / 100)} />
              </div>
              <div className="text-xs mt-2" style={{ color: colors.text4 }}>
                Aplicados sobre a renda líquida nas variantes fiscais.
              </div>
            </GlassPanel>
          </div>

          {/* ── RIGHT: RESULTS (sticky no desktop) ── */}
          <div id="resultados" className={`space-y-3 ${activeTab === "inputs" ? "hidden md:block" : ""} lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1`}>

            {/* KPI Grid — 2 colunas mobile, 4 desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
              <MetricCard value={results.rendaMensalLiquida} label="Renda líquida / mês" valido={results.temReceita}
                formatter={formatCurrency} icon={<TrendingUp size={14} />} accent="green" size="lg" isDark={isDark} colors={colors} />
              <MetricCard value={results.rendaMensalLiquida * 12} label="Renda líquida / ano" valido={results.temReceita}
                formatter={formatCurrency} icon={<TrendingUp size={14} />} accent="green" size="lg" isDark={isDark} colors={colors} />
              <MetricCard value={results.ganhoFinanceiroMensal} label="Rentabilidade / mês s/ capital" valido={results.temReceita && results.temBaseCapital}
                formatter={(v) => `${formatPercent(v)} a.m.`} icon={<Percent size={14} />} accent={rentAccent as "green"|"amber"|"red"} size="lg" isDark={isDark} colors={colors} />
              <MetricCard value={results.receitaBrutaMensal} label="Receita bruta / mês" valido={results.temReceita}
                formatter={formatCurrency} icon={<DollarSign size={14} />} accent="blue" isDark={isDark} colors={colors} />
            </div>

            {/* Composição da renda */}
            <GlassPanel delay={0.1} colors={colors}>
              <SectionHeader icon={<BarChart3 size={13} />} label="Composição da Renda" colors={colors} />
              <div className="space-y-2">
                {/* Ordem: Receita bruta (topo) -> custos ordenados do maior para o menor -> Renda líquida (base) */}
                <WaterfallBar label="Receita bruta" value={results.receitaBrutaMensal} total={results.receitaBrutaMensal} color={colors.blue} colors={colors} />
                <div className="h-px my-2" style={{ background: colors.divider }} />
                {[
                  { label: "Financiamento", value: results.parcelaFinanciamento, color: colors.amber },
                  { label: "Adm + Seguro", value: results.adminSeguro, color: colors.amber },
                  { label: "Condomínio", value: inputs.condominio, color: colors.red },
                  { label: "Wi-Fi/Água/Luz", value: inputs.wifi + inputs.agua + inputs.luz, color: colors.red },
                  { label: "IPTU", value: inputs.iptuMensal, color: colors.red },
                ]
                  .sort((a, b) => b.value - a.value)
                  .map(({ label, value, color }) => (
                    <WaterfallBar key={label} label={label} value={value} total={results.receitaBrutaMensal} color={color} isNegative colors={colors} />
                  ))
                }
                <div className="h-px my-2" style={{ background: colors.divider }} />
                <WaterfallBar label="Renda líquida" value={results.rendaMensalLiquida} total={results.receitaBrutaMensal}
                  color={isPositive ? colors.green : colors.red} colors={colors} />
              </div>
            </GlassPanel>

            {/* Variantes fiscais */}
            <GlassPanel delay={0.15} colors={colors}>
              <SectionHeader icon={<Shield size={13} />} label="Variantes Fiscais" colors={colors} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
                <FiscalCard label="Lucro" renda={results.rendaMensalLiquida}
                  rentabilidade={results.rentabilidadeAnual} receitaBruta={results.receitaBrutaMensal}
                  icon={<DollarSign size={13} />} valido={results.temReceita} validoPct={results.temReceita && results.temBaseCapital}
                  accent="blue" isHighlight isDark={isDark} colors={colors} />
                <FiscalCard label="Holding" renda={results.rendaHolding}
                  rentabilidade={results.rentabilidadeHoldingAnual} receitaBruta={results.receitaBrutaMensal}
                  icon={<Shield size={13} />} valido={results.temReceita} validoPct={results.temReceita && results.temBaseCapital}
                  accent="green" isDark={isDark} colors={colors} />
                <FiscalCard label="PF" renda={results.rendaPF}
                  rentabilidade={results.rentabilidadePFAnual} receitaBruta={results.receitaBrutaMensal}
                  icon={<User size={13} />} valido={results.temReceita} validoPct={results.temReceita && results.temBaseCapital}
                  accent="amber" isDark={isDark} colors={colors} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs" style={{ color: colors.text4 }}>
                <div className="rounded-lg px-3 py-2" style={{ background: colors.inputBg }}>
                  <span style={{ color: colors.green }}>Holding</span>: desconto de {Math.round(inputs.impostoHolding * 100)}% sobre a renda líquida
                </div>
                <div className="rounded-lg px-3 py-2" style={{ background: colors.inputBg }}>
                  <span style={{ color: colors.amber }}>PF</span>: desconto de {Math.round(inputs.impostoPF * 100)}% sobre a renda líquida
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
                    fontFamily: "var(--font-sans)",
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
                        <span style={{ color, fontFamily: "var(--font-mono)" }}>{days} dias ({((days / 30) * 100).toFixed(0)}%)</span>
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
                      <span className={`text-sm ${bold ? "font-black" : "font-semibold"}`} style={{ color, fontFamily: "var(--font-mono)" }}>
                        {value < 0 ? "−" : ""}{formatCurrency(Math.abs(value))}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: colors.text3 }}>Rentabilidade mensal s/ capital investido</span>
                      <span className="text-sm font-bold" style={{ color: colors.blue, fontFamily: "var(--font-mono)" }}>
                        {formatPercent(results.ganhoFinanceiroMensal)} a.m.
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color: colors.text2 }}>Rentabilidade anual</span>
                      <span className="text-base font-black" style={{ color: rentColor, fontFamily: "var(--font-mono)" }}>
                        {formatPercent(results.rentabilidadeAnual)} a.a.
                      </span>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </div>

            {/* Breakeven do Total Investido */}
            {(() => {
              const totalInv = results.capitalProprioTotal;
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
                          <span className="text-4xl font-black" style={{ color: colors.green, fontFamily: "var(--font-sans)" }}>
                            {anos}a {mesesRest}m
                          </span>
                          <span className="text-xs" style={{ color: colors.text3 }}>({mesesParaBreakeven} meses)</span>
                        </div>
                      ) : !results.temReceita ? (
                        <div className="text-lg font-bold" style={{ color: colors.text4 }}>Preencha receita e despesas para calcular</div>
                      ) : (
                        <div className="text-2xl font-black" style={{ color: colors.red }}>Renda negativa</div>
                      )}
                      <div className="text-xs mt-1" style={{ color: colors.text4 }}>
                        Base: {formatCurrency(totalInv)} investidos{calc.mobilia > 0 ? ` (incl. R$ ${calc.mobilia.toLocaleString('pt-BR')} decoração)` : ''} ÷ {formatCurrency(rendaLiq)}/mês
                      </div>
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span style={{ color: colors.text3 }}>Progresso anual estimado</span>
                        <span style={{ color: colors.green, fontFamily: "var(--font-mono)" }}>{progressPct.toFixed(1)}% / ano</span>
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
                          { label: `Holding (−${Math.round(inputs.impostoHolding * 100)}%)`, meses: mesesParaBreakeven !== null && results.rendaHolding > 0 ? Math.ceil(totalInv / results.rendaHolding) : null, color: colors.blue },
                          { label: `PF (−${Math.round(inputs.impostoPF * 100)}%)`, meses: mesesParaBreakeven !== null && results.rendaPF > 0 ? Math.ceil(totalInv / results.rendaPF) : null, color: colors.amber },
                        ].map(({ label, meses, color }) => (
                          <div key={label} className="text-center p-2 rounded-xl" style={{ background: colors.inputBg }}>
                            <div className="text-xs mb-0.5" style={{ color: colors.text4 }}>{label}</div>
                            {meses !== null ? (
                              <>
                                <div className="text-sm font-black" style={{ color, fontFamily: "var(--font-mono)" }}>
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

            {/* ── QUADRO DE RENTABILIDADE (TEMPLATE AIRBNB) ── */}
            <GlassPanel delay={0.32} colors={colors}>
              <SectionHeader icon={<BarChart3 size={13} />} label="Quadro de Rentabilidade" colors={colors} />
              <QuadroRentabilidade
                inputs={inputsComFluxo}
                results={results}
                nomeEmpreendimento={nomeEmpreendimento}
              />
            </GlassPanel>

          </div>
        </div>
      </div>
      {/* FOOTER */}
      <footer className="py-6 px-4 pb-24 md:pb-6 text-center" style={{ borderTop: `1px solid ${colors.divider}` }}>
        <p className="text-xs" style={{ color: colors.text4 }}>
          Calculadora de rentabilidade para locação de curta temporada. Os valores são estimativas e não constituem assessoria financeira.
        </p>
      </footer>

      {/* Barra-resumo fixa (mobile) */}
      <MobileSummaryBar results={results} isDark={isDark} />
    </div>
  );
}
