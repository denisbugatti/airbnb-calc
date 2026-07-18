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
import Home from "./pages/Home";
import FluxoPage from "./pages/Fluxo";
import { Calculator, DollarSign, History, FileText, LogOut } from "lucide-react";
import CenariosPage from "@/pages/Cenarios";
import PdfPage from "@/pages/Pdf";
import LoginPage from "@/pages/Login";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useVitaconColors } from "@/lib/vitaconColors";
import { SplashScreen } from "./components/SplashScreen";

// ─── Logo oficial Vitacon (PNG branco; inverte para preto no tema claro) ──────
export function VitaconLogo({ className = "", dark }: { className?: string; dark: boolean }) {
  return (
    <img
      src="/vitacon-logo.png"
      alt="Vitacon"
      className={className}
      style={{ filter: dark ? "none" : "invert(1)" }}
    />
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function NavBar() {
  const [location] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colors = useVitaconColors(isDark);

  const tabs = [
    { path: "/fluxo", label: "Fluxo de Pagamento", icon: <DollarSign size={14} /> },
    { path: "/", label: "Calculadora", icon: <Calculator size={14} /> },
    { path: "/cenarios", label: "Cenários", icon: <History size={14} /> },
    { path: "/pdf", label: "PDF", icon: <FileText size={14} /> },
  ];

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between gap-2 px-3 md:px-6 py-2.5 md:py-4"
      style={{
        background: isDark ? "rgba(0,0,0,0.9)" : "rgba(248,247,242,0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid ${colors.border}`,
        paddingTop: "max(0.625rem, env(safe-area-inset-top))",
      }}
    >
      {/* Logo */}
      <div className="flex items-center shrink-0">
        <VitaconLogo dark={isDark} className="h-4 md:h-5 w-auto" />
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-1 rounded-xl p-1"
        style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}
      >
        {tabs.map((tab) => {
          const active = location === tab.path;
          return (
            <Link key={tab.path} href={tab.path}>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: active ? (isDark ? colors.blueBg : "#FFFFFF") : "transparent",
                  color: active ? colors.blue : colors.text3,
                  border: active ? `1px solid ${colors.blueBorder}` : "1px solid transparent",
                  boxShadow: active && !isDark ? "0 1px 4px rgba(10,10,11,0.08)" : "none",
                }}
              >
                {tab.icon}
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Right: usuário logado + sair */}
      <NavUsuario colors={colors} />
    </nav>
  );
}

function NavUsuario({ colors }: { colors: ReturnType<typeof useVitaconColors> }) {
  const { usuario, logout } = useAuth();
  if (!usuario) return <div className="shrink-0" />;
  const primeiroNome = usuario.nome.split(" ")[0];
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span
        className="hidden sm:block text-[10px] uppercase tracking-widest"
        style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}
      >
        {primeiroNome}
      </span>
      <button
        onClick={logout}
        className="press w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.text3 }}
        title={`Sair (${usuario.nome})`}
      >
        <LogOut size={12} />
      </button>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
function Router() {
  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        background: "var(--background)",
        fontFamily: "var(--font-sans)",
        transition: "background 0.3s ease",
      }}
    >
      <div className="relative" style={{ zIndex: 1 }}>
        <NavBar />
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/fluxo" component={FluxoPage} />
          <Route path="/cenarios" component={CenariosPage} />
          <Route path="/pdf" component={PdfPage} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
function Gate() {
  const { usuario } = useAuth();
  if (!usuario) return <LoginPage />;
  return (
    <>
      <SplashScreen />
      <Router />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <FluxoProvider>
            <CenariosProvider>
              <TooltipProvider>
                <Toaster />
                <Gate />
              </TooltipProvider>
            </CenariosProvider>
          </FluxoProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
