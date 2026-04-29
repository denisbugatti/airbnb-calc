import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Link, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FluxoProvider, useFluxo } from "./contexts/FluxoContext";
import Home from "./pages/Home";
import FluxoPage from "./pages/Fluxo";
import { Calculator, GitBranch, Zap } from "lucide-react";
import { useCursorGlow } from "@/hooks/useCursorGlow";
import { motion } from "framer-motion";

// ─── Sync: Fluxo → Calculadora ────────────────────────────────────────────────
// Este componente vive dentro do FluxoProvider e pode ser usado para
// passar dados do fluxo para a calculadora via URL params ou context futuro.
// Por ora, o Home.tsx lê diretamente do FluxoContext.

function NavBar() {
  const [location] = useLocation();
  const tabs = [
    { path: "/", label: "Calculadora", icon: <Calculator size={14} /> },
    { path: "/fluxo", label: "Fluxo de Pagamento", icon: <GitBranch size={14} /> },
  ];

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 md:py-4"
      style={{
        background: "oklch(0 0 0 / 0.8)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid oklch(1 0 0 / 0.06)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center"
          style={{
            background: "oklch(0.78 0.12 210 / 0.15)",
            border: "1px solid oklch(0.78 0.12 210 / 0.3)",
          }}
        >
          <Zap size={14} style={{ color: "oklch(0.78 0.12 210)" }} />
        </div>
        <span className="text-sm font-bold hidden sm:block" style={{ color: "oklch(0.95 0 0)" }}>
          Short Stay
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
        {tabs.map((tab) => {
          const active = location === tab.path;
          return (
            <Link key={tab.path} href={tab.path}>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: active ? "oklch(0.78 0.12 210 / 0.15)" : "transparent",
                  color: active ? "oklch(0.88 0.12 210)" : "oklch(0.5 0.01 240)",
                  border: active ? "1px solid oklch(0.78 0.12 210 / 0.25)" : "1px solid transparent",
                }}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <span className="hidden md:block text-xs shrink-0" style={{ color: "oklch(0.4 0.01 240)" }}>
        Rentabilidade Imobiliária
      </span>
    </nav>
  );
}

// ─── Cursor Glow (global, atrás de tudo) ─────────────────────────────────────
function GlobalBackground() {
  const { springX, springY, springOpacity } = useCursorGlow();
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0, pointerEvents: "none" }}>
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
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle, oklch(0.72 0.14 210 / 0.07) 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: "radial-gradient(circle, oklch(0.65 0.12 260 / 0.05) 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "128px 128px" }} />
    </div>
  );
}

function Router() {
  return (
    <div className="min-h-screen w-full relative" style={{ background: "#000", fontFamily: "'Geist', sans-serif" }}>
      <GlobalBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <NavBar />
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

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <FluxoProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </FluxoProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
