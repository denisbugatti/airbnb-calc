/**
 * App.tsx — Calculadora de Rentabilidade Short Stay
 * Dual theme: Dark Cosmos (dark) / Slate Premium (light)
 * Toggle dark/light na navbar. Background adaptativo por tema.
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation, Link } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { FluxoProvider } from "@/contexts/FluxoContext";
import { CenariosProvider } from "@/contexts/CenariosContext";
import HistoricoCenarios from "@/components/HistoricoCenarios";
import { useFluxo } from "@/contexts/FluxoContext";
import Home from "./pages/Home";
import FluxoPage from "./pages/Fluxo";
import { useCursorGlow } from "./hooks/useCursorGlow";
import { motion } from "framer-motion";
import { Zap, Calculator, GitBranch, Sun, Moon } from "lucide-react";

// ─── Navbar ───────────────────────────────────────────────────────────────────
function NavBar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const tabs = [
    { path: "/fluxo", label: "Fluxo de Pagamento", icon: <GitBranch size={14} /> },
    { path: "/", label: "Calculadora", icon: <Calculator size={14} /> },
  ];

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between gap-2 px-3 md:px-6 py-2.5 md:py-4"
      style={{
        background: isDark ? "oklch(0.04 0 0 / 0.85)" : "oklch(1 0 0 / 0.9)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: isDark ? "1px solid oklch(1 0 0 / 0.07)" : "1px solid oklch(0.88 0.008 240)",
        boxShadow: isDark ? "none" : "0 1px 12px oklch(0 0 0 / 0.06)",
        paddingTop: "max(0.625rem, env(safe-area-inset-top))",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center"
          style={{
            background: isDark ? "oklch(0.78 0.12 210 / 0.15)" : "oklch(0.52 0.22 250 / 0.1)",
            border: isDark ? "1px solid oklch(0.78 0.12 210 / 0.3)" : "1px solid oklch(0.52 0.22 250 / 0.25)",
          }}
        >
          <Zap size={14} style={{ color: isDark ? "oklch(0.78 0.12 210)" : "oklch(0.52 0.22 250)" }} />
        </div>
        <span
          className="text-sm font-bold hidden sm:block"
          style={{ color: isDark ? "oklch(0.95 0 0)" : "oklch(0.18 0.01 260)" }}
        >
          Short Stay
        </span>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-1 rounded-xl p-1"
        style={{
          background: isDark ? "oklch(1 0 0 / 0.04)" : "oklch(0.94 0.006 240)",
          border: isDark ? "1px solid oklch(1 0 0 / 0.08)" : "1px solid oklch(0.88 0.008 240)",
        }}
      >
        {tabs.map((tab) => {
          const active = location === tab.path;
          return (
            <Link key={tab.path} href={tab.path}>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: active
                    ? isDark ? "oklch(0.78 0.12 210 / 0.15)" : "oklch(1 0 0)"
                    : "transparent",
                  color: active
                    ? isDark ? "oklch(0.88 0.12 210)" : "oklch(0.52 0.22 250)"
                    : isDark ? "oklch(0.5 0.01 240)" : "oklch(0.52 0.01 260)",
                  border: active
                    ? isDark ? "1px solid oklch(0.78 0.12 210 / 0.25)" : "1px solid oklch(0.88 0.008 240)"
                    : "1px solid transparent",
                  boxShadow: active && !isDark ? "0 1px 4px oklch(0 0 0 / 0.08)" : "none",
                }}
              >
                {tab.icon}
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Right: label + toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="hidden md:block text-xs"
          style={{ color: isDark ? "oklch(0.4 0.01 240)" : "oklch(0.52 0.01 260)" }}
        >
          Rentabilidade Imobiliária
        </span>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: isDark ? "oklch(1 0 0 / 0.06)" : "oklch(0.94 0.006 240)",
            border: isDark ? "1px solid oklch(1 0 0 / 0.1)" : "1px solid oklch(0.88 0.008 240)",
            color: isDark ? "oklch(0.78 0.12 210)" : "oklch(0.52 0.22 250)",
          }}
          title={isDark ? "Modo claro" : "Modo escuro"}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </nav>
  );
}

// ─── Background adaptativo por tema ──────────────────────────────────────────
function GlobalBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { springX, springY, springOpacity } = useCursorGlow();

  if (isDark) {
    return (
      <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0, pointerEvents: "none" }}>
        {/* Cursor glow */}
        <motion.div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, oklch(0.72 0.16 210 / 0.22) 0%, oklch(0.72 0.16 210 / 0.08) 40%, transparent 70%)",
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%",
            opacity: springOpacity,
            filter: "blur(4px)",
          }}
        />
        {/* Ambient glows */}
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle, oklch(0.72 0.14 210 / 0.07) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: "radial-gradient(circle, oklch(0.65 0.12 260 / 0.05) 0%, transparent 70%)", filter: "blur(80px)" }} />
        {/* Noise grain */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "128px 128px" }} />
      </div>
    );
  }

  // LIGHT: glow suave azul cobalto no cursor, fundo off-white quente
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0, pointerEvents: "none" }}>
      {/* Cursor glow — suave para não poluir o fundo claro */}
      <motion.div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, oklch(0.52 0.22 250 / 0.08) 0%, oklch(0.52 0.22 250 / 0.03) 40%, transparent 70%)",
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: springOpacity,
          filter: "blur(8px)",
        }}
      />
      {/* Ambient — canto superior direito: azul cobalto muito suave */}
      <div style={{ position: "absolute", top: "-15%", right: "-5%", width: "45%", height: "45%", borderRadius: "50%", background: "radial-gradient(circle, oklch(0.52 0.22 250 / 0.06) 0%, transparent 70%)", filter: "blur(80px)" }} />
      {/* Ambient — canto inferior esquerdo: verde esmeralda muito suave */}
      <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "40%", height: "40%", borderRadius: "50%", background: "radial-gradient(circle, oklch(0.55 0.2 145 / 0.05) 0%, transparent 70%)", filter: "blur(100px)" }} />
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
function Router() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        background: isDark ? "oklch(0.04 0 0)" : "oklch(0.975 0.004 80)",
        fontFamily: "'Geist', sans-serif",
        transition: "background 0.3s ease",
      }}
    >
      <GlobalBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <NavBar />
        <RouterHistorico />
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/fluxo" component={FluxoPage} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
function RouterHistorico() {
  const { fluxo } = useFluxo();
  return (
    <HistoricoCenarios
      onRestaurar={(_cenario) => {
        // Restaurar é tratado dentro do Home.tsx via evento customizado
        window.dispatchEvent(new CustomEvent("restaurar-cenario", { detail: _cenario }));
      }}
    />
  );
}
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <FluxoProvider>
          <CenariosProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </CenariosProvider>
        </FluxoProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
