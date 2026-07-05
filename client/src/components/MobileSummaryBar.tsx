/**
 * Barra fixa no rodapé (mobile) com os 3 números-chave.
 * Toque rola até a seção de resultados.
 */
import { formatCurrency, formatPercent, type CalculatorResults } from "@/lib/calculator";
import { useVitaconColors as useColors } from "@/lib/vitaconColors";

export function MobileSummaryBar({ results, isDark }: { results: CalculatorResults; isDark: boolean }) {
  const colors = useColors(isDark);
  const ok = results.temReceita;
  const okPct = ok && results.temBaseCapital;
  const item = (label: string, value: string, color: string) => (
    <div className="flex flex-col items-center min-w-0">
      <span className="text-[10px] uppercase tracking-wider truncate" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>{label}</span>
      <span className="text-sm font-bold truncate" style={{ color, fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
  );
  return (
    <button
      className="fixed bottom-0 inset-x-0 z-40 grid grid-cols-3 gap-2 px-4 py-2.5 md:hidden"
      style={{
        background: isDark ? "rgba(10,10,11,0.92)" : "rgba(255,255,255,0.95)",
        borderTop: `1px solid ${colors.border}`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))",
      }}
      onClick={() => document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" })}
    >
      {item("Renda/mês", ok ? formatCurrency(results.rendaMensalLiquida) : "—", results.rendaMensalLiquida >= 0 ? colors.green : colors.red)}
      {item("Retorno a.m.", okPct ? formatPercent(results.ganhoFinanceiroMensal) : "—", colors.blue)}
      {item("Retorno a.a.", okPct ? formatPercent(results.rentabilidadeAnual) : "—", colors.blue)}
    </button>
  );
}
