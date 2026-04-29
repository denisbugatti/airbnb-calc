/**
 * Home.tsx — Calculadora de Rentabilidade Short Stay
 * Design: Dark Cosmos — inspirado no Halo template
 * Fundo preto puro + luz que segue cursor/toque + glassmorphism + Geist
 */

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  calcular,
  formatCurrency,
  formatPercent,
  defaultInputs,
  type CalculatorInputs,
} from "@/lib/calculator";
import {
  Building2,
  TrendingUp,
  DollarSign,
  Percent,
  ChevronDown,
  ChevronUp,
  Info,
  Home,
  Zap,
  BarChart3,
  Shield,
  User,
  Minus,
  Calculator,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ─── Cursor Glow Hook ─────────────────────────────────────────────────────────
function useCursorGlow() {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const opacity = useMotionValue(0);
  const springOpacity = useSpring(opacity, { stiffness: 60, damping: 18 });

  useEffect(() => {
    let fadeTimeout: ReturnType<typeof setTimeout>;

    const handleMove = (x: number, y: number) => {
      mouseX.set(x);
      mouseY.set(y);
      opacity.set(1);
      clearTimeout(fadeTimeout);
      fadeTimeout = setTimeout(() => opacity.set(0), 2000);
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) handleMove(t.clientX, t.clientY);
    };
    const onTouchEnd = () => {
      fadeTimeout = setTimeout(() => opacity.set(0), 800);
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

// ─── Animated Number Hook ────────────────────────────────────────────────────
function useAnimatedNumber(value: number, duration = 400) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(start + (end - start) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return displayed;
}

// ─── Input Field Component ────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  step?: number;
  tooltip?: string;
  integer?: boolean;
}

function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min = 0,
  step = 1,
  tooltip,
  integer = false,
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState("");

  const displayValue = focused
    ? raw
    : integer
    ? Math.round(value).toString()
    : value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const handleFocus = () => {
    setFocused(true);
    setRaw(value.toString().replace(".", ","));
  };

  const handleBlur = () => {
    setFocused(false);
    const cleaned = raw.replace(/\./g, "").replace(",", ".");
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && parsed >= min) onChange(parsed);
  };

  const increment = () => onChange(Math.max(min, value + step));
  const decrement = () => onChange(Math.max(min, value - step));

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium" style={{ color: "oklch(0.6 0.01 240)" }}>
          {label}
        </label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info size={12} className="cursor-help" style={{ color: "oklch(0.4 0.01 240)" }} />
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-48 text-xs"
              style={{
                background: "oklch(0.12 0.005 240)",
                border: "1px solid oklch(1 0 0 / 0.12)",
                color: "oklch(0.85 0 0)",
              }}
            >
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div
        className="flex items-center rounded-xl transition-all duration-200"
        style={{
          background: focused ? "oklch(1 0 0 / 0.07)" : "oklch(1 0 0 / 0.04)",
          border: `1px solid ${focused ? "oklch(0.78 0.12 210 / 0.5)" : "oklch(1 0 0 / 0.08)"}`,
          boxShadow: focused ? "0 0 0 3px oklch(0.78 0.12 210 / 0.1)" : "none",
        }}
      >
        {prefix && (
          <span className="pl-3 text-sm font-medium select-none" style={{ color: "oklch(0.5 0.01 240)" }}>
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={(e) => setRaw(e.target.value)}
          className="flex-1 bg-transparent px-3 py-3 text-sm font-medium outline-none min-w-0"
          style={{ color: "oklch(0.95 0 0)", fontFamily: "'Geist Mono', monospace" }}
        />
        {suffix && (
          <span className="pr-2 text-xs select-none" style={{ color: "oklch(0.5 0.01 240)" }}>
            {suffix}
          </span>
        )}
        <div className="flex flex-col border-l" style={{ borderColor: "oklch(1 0 0 / 0.06)" }}>
          <button
            onClick={increment}
            className="px-2.5 py-2 transition-colors hover:bg-white/5 rounded-tr-xl active:bg-white/10"
            style={{ color: "oklch(0.5 0.01 240)" }}
          >
            <ChevronUp size={13} />
          </button>
          <button
            onClick={decrement}
            className="px-2.5 py-2 transition-colors hover:bg-white/5 rounded-br-xl active:bg-white/10"
            style={{ color: "oklch(0.5 0.01 240)" }}
          >
            <ChevronDown size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Accent colors ────────────────────────────────────────────────────────────
const accentColors = {
  blue:  { text: "oklch(0.78 0.12 210)", glow: "oklch(0.78 0.12 210 / 0.15)", border: "oklch(0.78 0.12 210 / 0.2)", bg: "oklch(0.78 0.12 210 / 0.06)", iconBg: "oklch(0.78 0.12 210 / 0.12)" },
  green: { text: "oklch(0.72 0.18 145)", glow: "oklch(0.72 0.18 145 / 0.15)", border: "oklch(0.72 0.18 145 / 0.2)", bg: "oklch(0.72 0.18 145 / 0.06)", iconBg: "oklch(0.72 0.18 145 / 0.12)" },
  amber: { text: "oklch(0.78 0.18 70)",  glow: "oklch(0.78 0.18 70 / 0.15)",  border: "oklch(0.78 0.18 70 / 0.2)",  bg: "oklch(0.78 0.18 70 / 0.06)",  iconBg: "oklch(0.78 0.18 70 / 0.12)"  },
  red:   { text: "oklch(0.65 0.22 25)",  glow: "oklch(0.65 0.22 25 / 0.15)",  border: "oklch(0.65 0.22 25 / 0.2)",  bg: "oklch(0.65 0.22 25 / 0.06)",  iconBg: "oklch(0.65 0.22 25 / 0.12)"  },
};

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({
  label, value, formatter, icon, accent = "blue", size = "sm", subtitle, delay = 0,
}: {
  label: string; value: number; formatter: (v: number) => string;
  icon: React.ReactNode; accent?: keyof typeof accentColors;
  size?: "sm" | "lg"; subtitle?: string; delay?: number;
}) {
  const colors = accentColors[accent];
  const animated = useAnimatedNumber(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: colors.bg, border: `1px solid ${colors.border}`, boxShadow: `0 4px 24px ${colors.glow}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: colors.iconBg, color: colors.text }}>
          {icon}
        </div>
        {subtitle && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: colors.iconBg, color: colors.text }}>
            {subtitle}
          </span>
        )}
      </div>
      <div
        className={`font-black tracking-tight ${size === "lg" ? "text-2xl md:text-3xl" : "text-xl"}`}
        style={{ color: colors.text, fontFamily: "'Geist', sans-serif", textShadow: `0 0 24px ${colors.glow}` }}
      >
        {formatter(animated)}
      </div>
      <div className="text-xs mt-1 font-medium" style={{ color: "oklch(0.55 0.01 240)" }}>
        {label}
      </div>
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "oklch(0.78 0.12 210 / 0.12)", color: "oklch(0.78 0.12 210)" }}>
        {icon}
      </div>
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "oklch(0.78 0.12 210)" }}>
        {label}
      </span>
    </div>
  );
}

// ─── Waterfall Bar ────────────────────────────────────────────────────────────
function WaterfallBar({ label, value, total, color, isNegative = false }: {
  label: string; value: number; total: number; color: string; isNegative?: boolean;
}) {
  const pct = total > 0 ? Math.min((Math.abs(value) / total) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <div className="w-20 md:w-28 text-right shrink-0">
        <span className="text-xs" style={{ color: "oklch(0.55 0.01 240)" }}>{label}</span>
      </div>
      <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: "oklch(1 0 0 / 0.04)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <div className="w-20 md:w-24 shrink-0 text-right">
        <span className="text-xs font-semibold" style={{ color: isNegative ? "oklch(0.65 0.22 25)" : color, fontFamily: "'Geist Mono', monospace" }}>
          {isNegative ? "−" : ""}{formatCurrency(Math.abs(value))}
        </span>
      </div>
    </div>
  );
}

// ─── Fiscal Card ──────────────────────────────────────────────────────────────
function FiscalCard({ label, renda, rentabilidade, icon, accent, isHighlight = false }: {
  label: string; renda: number; rentabilidade: number;
  icon: React.ReactNode; accent: "blue" | "green" | "amber"; isHighlight?: boolean;
}) {
  const colors = accentColors[accent];
  const animRenda = useAnimatedNumber(renda);
  const animRent = useAnimatedNumber(rentabilidade);
  return (
    <div
      className="rounded-2xl p-3 md:p-4 flex flex-col gap-2 md:gap-3 transition-all duration-300"
      style={{
        background: isHighlight ? colors.bg : "oklch(1 0 0 / 0.03)",
        border: `1px solid ${isHighlight ? colors.border : "oklch(1 0 0 / 0.07)"}`,
        boxShadow: isHighlight ? `0 4px 32px ${colors.glow}` : "none",
      }}
    >
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: colors.iconBg, color: colors.text }}>
          {icon}
        </div>
        <span className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.text }}>{label}</span>
      </div>
      <div>
        <div className="text-lg md:text-2xl font-black" style={{ color: colors.text, fontFamily: "'Geist', sans-serif", textShadow: `0 0 20px ${colors.glow}` }}>
          {formatCurrency(animRenda)}
        </div>
        <div className="text-xs mt-0.5" style={{ color: "oklch(0.5 0.01 240)" }}>renda / mês</div>
      </div>
      <div className="pt-2 border-t" style={{ borderColor: "oklch(1 0 0 / 0.06)" }}>
        <div className="text-base md:text-lg font-bold" style={{ color: colors.text, fontFamily: "'Geist Mono', monospace" }}>
          {formatPercent(animRent)} a.a.
        </div>
        <div className="text-xs mt-0.5" style={{ color: "oklch(0.5 0.01 240)" }}>rentabilidade anual</div>
      </div>
    </div>
  );
}

// ─── Glass Panel ──────────────────────────────────────────────────────────────
function GlassPanel({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`rounded-2xl p-4 md:p-5 ${className}`}
      style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.08)", backdropFilter: "blur(16px)" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<"inputs" | "results">("inputs");

  const results = useMemo(() => calcular(inputs), [inputs]);
  const set = useCallback((key: keyof CalculatorInputs) => (value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isPositive = results.rendaMensalLiquida > 0;
  const rentAccent = results.rentabilidadeAnual >= 15 ? "green" : results.rentabilidadeAnual >= 8 ? "amber" : "red";

  // Cursor glow
  const { springX, springY, springOpacity } = useCursorGlow();

  return (
    <div
      className="min-h-screen w-full relative overflow-x-hidden"
      style={{ background: "#000", fontFamily: "'Geist', sans-serif" }}
    >
      {/* ── CURSOR / TOUCH GLOW ── */}
      <motion.div
        className="fixed pointer-events-none"
        style={{
          zIndex: 0,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, oklch(0.72 0.14 210 / 0.18) 0%, oklch(0.72 0.14 210 / 0.06) 40%, transparent 70%)",
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: springOpacity,
          filter: "blur(8px)",
        }}
      />

      {/* Ambient glow — always visible, subtle */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: "radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.72 0.14 210 / 0.12) 0%, transparent 70%)",
        }}
      />

      {/* Noise texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          zIndex: 1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Content */}
      <div className="relative" style={{ zIndex: 2 }}>

        {/* ── NAVBAR ── */}
        <nav
          className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 md:py-4"
          style={{ background: "oklch(0 0 0 / 0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid oklch(1 0 0 / 0.06)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.78 0.12 210 / 0.15)", border: "1px solid oklch(0.78 0.12 210 / 0.3)" }}
            >
              <Calculator size={14} style={{ color: "oklch(0.78 0.12 210)" }} />
            </div>
            <span className="text-sm font-bold" style={{ color: "oklch(0.95 0 0)" }}>Short Stay</span>
            <span
              className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "oklch(0.78 0.12 210 / 0.1)", color: "oklch(0.78 0.12 210)", border: "1px solid oklch(0.78 0.12 210 / 0.2)" }}
            >
              Calculadora
            </span>
          </div>
          <span className="hidden md:block text-xs" style={{ color: "oklch(0.4 0.01 240)" }}>
            Rentabilidade Imobiliária
          </span>
        </nav>

        {/* ── HERO ── */}
        <section className="px-4 md:px-6 pt-10 md:pt-16 pb-6 md:pb-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
              style={{ background: "oklch(0.78 0.12 210 / 0.08)", border: "1px solid oklch(0.78 0.12 210 / 0.2)", color: "oklch(0.78 0.12 210)" }}
            >
              <Zap size={11} />
              Análise em tempo real
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none mb-4"
              style={{ color: "#ffffff", textShadow: "0 1px 32px rgba(0,0,0,0.6)" }}
            >
              Calcule sua{" "}
              <span style={{ color: "oklch(0.78 0.15 210)", textShadow: "0 0 60px oklch(0.78 0.15 210 / 0.7), 0 0 120px oklch(0.78 0.15 210 / 0.3)" }}>
                rentabilidade
              </span>
            </h1>
            <p className="text-sm md:text-base font-light max-w-xl mx-auto" style={{ color: "oklch(0.75 0.01 240)" }}>
              Simule o retorno do seu imóvel em locação de curta temporada.
              Análise completa com variantes fiscais e métricas de investimento.
            </p>
          </motion.div>
        </section>

        {/* ── MOBILE: KPIs sempre visíveis no topo ── */}
        <div className="lg:hidden px-4 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              label="Renda líquida / mês"
              value={results.rendaMensalLiquida}
              formatter={formatCurrency}
              icon={<TrendingUp size={14} />}
              accent={isPositive ? "green" : "red"}
              size="lg"
              delay={0.05}
            />
            <MetricCard
              label="Rentabilidade anual"
              value={results.rentabilidadeAnual}
              formatter={(v) => formatPercent(v) + " a.a."}
              icon={<Percent size={14} />}
              accent={rentAccent as "green" | "amber" | "red"}
              size="lg"
              delay={0.1}
            />
          </div>
        </div>

        {/* ── MOBILE TABS ── */}
        <div className="lg:hidden flex mx-4 mb-4 rounded-xl overflow-hidden" style={{ border: "1px solid oklch(1 0 0 / 0.1)" }}>
          {(["inputs", "results"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab ? "oklch(0.78 0.12 210 / 0.12)" : "transparent",
                color: activeTab === tab ? "oklch(0.78 0.12 210)" : "oklch(0.5 0.01 240)",
                borderBottom: activeTab === tab ? "2px solid oklch(0.78 0.12 210)" : "2px solid transparent",
              }}
            >
              {tab === "inputs" ? "📊 Dados" : "📈 Resultados"}
            </button>
          ))}
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[440px_1fr] gap-4 md:gap-5">

            {/* ════ LEFT — INPUTS ════ */}
            <div className={`space-y-3 md:space-y-4 ${activeTab === "results" ? "hidden lg:block" : ""}`}>

              {/* Ficha Técnica */}
              <GlassPanel delay={0.1}>
                <SectionHeader icon={<Building2 size={13} />} label="Ficha Técnica" />
                <div className="space-y-3">
                  <InputField label="Área do imóvel" value={inputs.areaM2} onChange={set("areaM2")} suffix="m²" step={1} integer tooltip="Área privativa em m²" />
                  <InputField label="Valor do imóvel" value={inputs.valorImovel} onChange={set("valorImovel")} prefix="R$" step={5000} tooltip="Valor de aquisição" />
                  <InputField label="Mobília e decoração" value={inputs.mobilia} onChange={set("mobilia")} prefix="R$" step={1000} tooltip="Investimento em mobília" />
                  <div className="grid grid-cols-2 gap-2 pt-2 mt-1" style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)" }}>
                    {[
                      { label: "Valor por m²", value: results.valorPorM2 },
                      { label: "Total da unidade", value: results.totalUnidade },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl p-2.5" style={{ background: "oklch(1 0 0 / 0.03)" }}>
                        <div className="text-xs mb-1" style={{ color: "oklch(0.5 0.01 240)" }}>{label}</div>
                        <div className="text-sm font-bold" style={{ color: "oklch(0.78 0.12 210)", fontFamily: "'Geist Mono', monospace" }}>
                          {formatCurrency(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassPanel>

              {/* Ocupação */}
              <GlassPanel delay={0.15}>
                <SectionHeader icon={<Home size={13} />} label="Ocupação & Receita" />
                <div className="space-y-3">
                  <InputField label="Valor da diária" value={inputs.diaria} onChange={set("diaria")} prefix="R$" step={10} tooltip="Diária média no Airbnb" />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium" style={{ color: "oklch(0.6 0.01 240)" }}>Dias ocupados / mês</label>
                      <span className="text-sm font-bold px-2 py-0.5 rounded-lg" style={{ background: "oklch(0.78 0.12 210 / 0.1)", color: "oklch(0.78 0.12 210)", fontFamily: "'Geist Mono', monospace" }}>
                        {inputs.diasOcupacao} dias
                      </span>
                    </div>
                    <Slider min={1} max={30} step={1} value={[inputs.diasOcupacao]} onValueChange={([v]) => set("diasOcupacao")(v)} />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs" style={{ color: "oklch(0.35 0.01 240)" }}>1</span>
                      <span className="text-xs" style={{ color: "oklch(0.35 0.01 240)" }}>30</span>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between rounded-xl px-3 py-2.5"
                    style={{ background: "oklch(0.78 0.12 210 / 0.06)", border: "1px solid oklch(0.78 0.12 210 / 0.15)" }}
                  >
                    <span className="text-xs font-medium" style={{ color: "oklch(0.65 0.08 210)" }}>Receita bruta mensal</span>
                    <span className="text-sm font-black" style={{ color: "oklch(0.78 0.12 210)", fontFamily: "'Geist Mono', monospace" }}>
                      {formatCurrency(results.receitaBrutaMensal)}
                    </span>
                  </div>
                </div>
              </GlassPanel>

              {/* Investimento */}
              <GlassPanel delay={0.2}>
                <SectionHeader icon={<DollarSign size={13} />} label="Investimento" />
                <div className="space-y-3">
                  <InputField label="Capital próprio" value={inputs.capitalProprio} onChange={set("capitalProprio")} prefix="R$" step={5000} tooltip="Base do Cash-on-Cash Return" />
                  <InputField label="Saldo a financiar" value={inputs.saldoFinanciar} onChange={set("saldoFinanciar")} prefix="R$" step={5000} tooltip="Zero = sem financiamento" />
                  {inputs.saldoFinanciar > 0 && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <InputField label="Taxa mensal" value={inputs.taxaJurosMensal * 100} onChange={(v) => set("taxaJurosMensal")(v / 100)} suffix="%" step={0.1} tooltip="Taxa de juros mensal" />
                        <InputField label="Prazo" value={inputs.prazoMeses} onChange={set("prazoMeses")} suffix="meses" step={12} integer tooltip="Prazo em meses" />
                      </div>
                      <div
                        className="flex items-center justify-between rounded-xl px-3 py-2.5"
                        style={{ background: "oklch(0.65 0.22 25 / 0.06)", border: "1px solid oklch(0.65 0.22 25 / 0.15)" }}
                      >
                        <span className="text-xs font-medium" style={{ color: "oklch(0.65 0.22 25 / 0.8)" }}>Parcela mensal (Price)</span>
                        <span className="text-sm font-black" style={{ color: "oklch(0.65 0.22 25)", fontFamily: "'Geist Mono', monospace" }}>
                          {formatCurrency(results.parcelaFinanciamento)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </GlassPanel>

              {/* Despesas */}
              <GlassPanel delay={0.25}>
                <SectionHeader icon={<BarChart3 size={13} />} label="Despesas Operacionais" />
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label="Condomínio" value={inputs.condominio} onChange={set("condominio")} prefix="R$" step={50} />
                    <InputField label="IPTU mensal" value={inputs.iptuMensal} onChange={set("iptuMensal")} prefix="R$" step={10} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium" style={{ color: "oklch(0.6 0.01 240)" }}>Adm + Seguro</label>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: "oklch(0.78 0.18 70 / 0.1)", color: "oklch(0.78 0.18 70)", fontFamily: "'Geist Mono', monospace" }}>
                        {formatPercent(inputs.taxaAdminSeguro * 100, 0)}
                      </span>
                    </div>
                    <Slider min={0} max={20} step={0.5} value={[inputs.taxaAdminSeguro * 100]} onValueChange={([v]) => set("taxaAdminSeguro")(v / 100)} />
                  </div>

                  {/* Advanced toggle */}
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between py-2 text-xs font-semibold transition-colors rounded-lg px-1"
                    style={{ color: showAdvanced ? "oklch(0.78 0.12 210)" : "oklch(0.5 0.01 240)" }}
                  >
                    <span>Custos Airbnb & Gestão</span>
                    {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium" style={{ color: "oklch(0.6 0.01 240)" }}>Taxa Airbnb</label>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: "oklch(0.78 0.18 70 / 0.1)", color: "oklch(0.78 0.18 70)", fontFamily: "'Geist Mono', monospace" }}>
                              {formatPercent(inputs.taxaPlataforma * 100, 0)}
                            </span>
                          </div>
                          <Slider min={0} max={15} step={0.5} value={[inputs.taxaPlataforma * 100]} onValueChange={([v]) => set("taxaPlataforma")(v / 100)} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <InputField label="Limpeza / check-in" value={inputs.custoLimpeza} onChange={set("custoLimpeza")} prefix="R$" step={10} tooltip="Custo por check-in" />
                          <InputField label="Check-ins / mês" value={inputs.checkInsMes} onChange={set("checkInsMes")} step={1} integer tooltip="Média de check-ins" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium" style={{ color: "oklch(0.6 0.01 240)" }}>Property Manager</label>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: "oklch(0.78 0.18 70 / 0.1)", color: "oklch(0.78 0.18 70)", fontFamily: "'Geist Mono', monospace" }}>
                              {formatPercent(inputs.taxaGestao * 100, 0)}
                            </span>
                          </div>
                          <Slider min={0} max={30} step={1} value={[inputs.taxaGestao * 100]} onValueChange={([v]) => set("taxaGestao")(v / 100)} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </GlassPanel>
            </div>

            {/* ════ RIGHT — RESULTS ════ */}
            <div className={`space-y-3 md:space-y-4 ${activeTab === "inputs" ? "hidden lg:block" : ""}`}>

              {/* KPIs — desktop only (mobile shows above) */}
              <div className="hidden lg:grid grid-cols-2 xl:grid-cols-4 gap-3">
                <MetricCard label="Renda líquida / mês" value={results.rendaMensalLiquida} formatter={formatCurrency} icon={<TrendingUp size={14} />} accent={isPositive ? "green" : "red"} size="lg" delay={0.1} />
                <MetricCard label="Rentabilidade anual" value={results.rentabilidadeAnual} formatter={(v) => formatPercent(v) + " a.a."} icon={<Percent size={14} />} accent={rentAccent as "green" | "amber" | "red"} size="lg" delay={0.15} />
                <MetricCard label="Receita bruta / mês" value={results.receitaBrutaMensal} formatter={formatCurrency} icon={<DollarSign size={14} />} accent="blue" delay={0.2} />
                <MetricCard label="Total de despesas" value={results.totalDespesas} formatter={formatCurrency} icon={<Minus size={14} />} accent="red" delay={0.25} />
              </div>

              {/* Waterfall */}
              <GlassPanel delay={0.2}>
                <SectionHeader icon={<BarChart3 size={13} />} label="Composição da Renda" />
                <div className="space-y-2">
                  <WaterfallBar label="Receita bruta" value={results.receitaBrutaMensal} total={results.receitaBrutaMensal} color="oklch(0.78 0.12 210)" />
                  {inputs.condominio > 0 && <WaterfallBar label="Condomínio" value={inputs.condominio} total={results.receitaBrutaMensal} color="oklch(0.65 0.22 25)" isNegative />}
                  {inputs.iptuMensal > 0 && <WaterfallBar label="IPTU" value={inputs.iptuMensal} total={results.receitaBrutaMensal} color="oklch(0.65 0.22 25)" isNegative />}
                  {results.adminSeguro > 0 && <WaterfallBar label="Adm + Seguro" value={results.adminSeguro} total={results.receitaBrutaMensal} color="oklch(0.65 0.22 25)" isNegative />}
                  {results.taxaPlataformaValor > 0 && <WaterfallBar label="Taxa Airbnb" value={results.taxaPlataformaValor} total={results.receitaBrutaMensal} color="oklch(0.65 0.22 25)" isNegative />}
                  {results.custoLimpezaMensal > 0 && <WaterfallBar label="Limpeza" value={results.custoLimpezaMensal} total={results.receitaBrutaMensal} color="oklch(0.65 0.22 25)" isNegative />}
                  {results.gestaoValor > 0 && <WaterfallBar label="Gestão" value={results.gestaoValor} total={results.receitaBrutaMensal} color="oklch(0.65 0.22 25)" isNegative />}
                  {results.parcelaFinanciamento > 0 && <WaterfallBar label="Financiamento" value={results.parcelaFinanciamento} total={results.receitaBrutaMensal} color="oklch(0.65 0.22 25)" isNegative />}
                  <div className="pt-2 mt-1" style={{ borderTop: "1px solid oklch(1 0 0 / 0.08)" }}>
                    <WaterfallBar label="Renda líquida" value={Math.max(0, results.rendaMensalLiquida)} total={results.receitaBrutaMensal} color={isPositive ? "oklch(0.72 0.18 145)" : "oklch(0.65 0.22 25)"} />
                  </div>
                </div>
              </GlassPanel>

              {/* Fiscal Comparison */}
              <GlassPanel delay={0.25}>
                <SectionHeader icon={<Shield size={13} />} label="Comparativo Fiscal" />
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  <FiscalCard label="Bruto" renda={results.rendaMensalLiquida} rentabilidade={results.rentabilidadeAnual} icon={<DollarSign size={13} />} accent="blue" isHighlight />
                  <FiscalCard label="Holding" renda={results.rendaHolding} rentabilidade={results.rentabilidadeHoldingAnual} icon={<Building2 size={13} />} accent="green" />
                  <FiscalCard label="PF" renda={results.rendaPF} rentabilidade={results.rentabilidadePFAnual} icon={<User size={13} />} accent="amber" />
                </div>
                <p className="mt-3 text-xs p-3 rounded-xl" style={{ background: "oklch(1 0 0 / 0.03)", color: "oklch(0.42 0.01 240)" }}>
                  Holding: redução de 6%. PF: redução de 27% (IR estimado). Consulte um contador.
                </p>
              </GlassPanel>

              {/* Breakeven + Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <GlassPanel delay={0.3}>
                  <SectionHeader icon={<Zap size={13} />} label="Breakeven" />
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs mb-1" style={{ color: "oklch(0.5 0.01 240)" }}>Dias mínimos p/ cobrir despesas</div>
                      <div
                        className="text-3xl font-black"
                        style={{ color: results.diasBreakeven <= inputs.diasOcupacao ? "oklch(0.72 0.18 145)" : "oklch(0.65 0.22 25)", fontFamily: "'Geist', sans-serif" }}
                      >
                        {results.diasBreakeven} dias
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { label: "Ocupação atual", days: inputs.diasOcupacao, color: "oklch(0.78 0.12 210)" },
                        { label: "Breakeven", days: results.diasBreakeven, color: "oklch(0.65 0.22 25 / 0.7)" },
                      ].map(({ label, days, color }) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: "oklch(0.5 0.01 240)" }}>{label}</span>
                            <span style={{ color, fontFamily: "'Geist Mono', monospace" }}>{days} dias ({((days / 30) * 100).toFixed(0)}%)</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(1 0 0 / 0.06)" }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((days / 30) * 100, 100)}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full rounded-full"
                              style={{ background: color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassPanel>

                <GlassPanel delay={0.35}>
                  <SectionHeader icon={<Calculator size={13} />} label="Resumo" />
                  <div className="space-y-1.5">
                    {[
                      { label: "Receita bruta", value: results.receitaBrutaMensal, color: "oklch(0.78 0.12 210)" },
                      { label: "Total despesas", value: -results.totalDespesas, color: "oklch(0.65 0.22 25)" },
                      { label: "Renda líquida", value: results.rendaMensalLiquida, color: isPositive ? "oklch(0.72 0.18 145)" : "oklch(0.65 0.22 25)", bold: true },
                    ].map(({ label, value, color, bold }) => (
                      <div key={label} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid oklch(1 0 0 / 0.05)" }}>
                        <span className={`text-xs ${bold ? "font-semibold" : ""}`} style={{ color: bold ? "oklch(0.8 0 0)" : "oklch(0.5 0.01 240)" }}>{label}</span>
                        <span className={`text-sm ${bold ? "font-black" : "font-semibold"}`} style={{ color, fontFamily: "'Geist Mono', monospace" }}>
                          {value < 0 ? "−" : ""}{formatCurrency(Math.abs(value))}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: "oklch(0.5 0.01 240)" }}>Ganho mensal s/ capital</span>
                        <span className="text-sm font-bold" style={{ color: "oklch(0.78 0.12 210)", fontFamily: "'Geist Mono', monospace" }}>
                          {formatPercent(results.ganhoFinanceiroMensal)} a.m.
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold" style={{ color: "oklch(0.7 0 0)" }}>Rentabilidade anual</span>
                        <span
                          className="text-base font-black"
                          style={{
                            color: rentAccent === "green" ? "oklch(0.72 0.18 145)" : rentAccent === "amber" ? "oklch(0.78 0.18 70)" : "oklch(0.65 0.22 25)",
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          {formatPercent(results.rentabilidadeAnual)} a.a.
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="py-6 px-4 text-center" style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)" }}>
          <p className="text-xs" style={{ color: "oklch(0.32 0.01 240)" }}>
            Calculadora de rentabilidade para locação de curta temporada. Os valores são estimativas e não constituem assessoria financeira.
          </p>
        </footer>
      </div>
    </div>
  );
}
