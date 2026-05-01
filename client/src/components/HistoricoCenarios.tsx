/**
 * HistoricoCenarios.tsx — Painel lateral de histórico de cenários salvos
 * Dark Cosmos / Slate Premium dual theme
 * Features: salvar, restaurar, duplicar, excluir, comparar lado a lado
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History, X, Trash2, RotateCcw, ChevronDown, ChevronUp,
  BookmarkPlus, Copy, GitCompare, CheckSquare, Square
} from "lucide-react";
import { useCenarios, type Cenario } from "@/contexts/CenariosContext";
import { useTheme } from "@/contexts/ThemeContext";
import { formatCurrency, formatPercent } from "@/lib/calculator";

interface Props {
  onRestaurar: (cenario: Cenario) => void;
}

export default function HistoricoCenarios({ onRestaurar }: Props) {
  const { cenarios, removerCenario, duplicarCenario, limparHistorico } = useCenarios();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [modoComparar, setModoComparar] = useState(false);
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const colors = {
    bg: isDark ? "oklch(0.08 0.005 240)" : "oklch(0.99 0.003 80)",
    panel: isDark ? "oklch(0.11 0.008 240)" : "oklch(1 0 0)",
    border: isDark ? "oklch(1 0 0 / 0.08)" : "oklch(0 0 0 / 0.07)",
    text1: isDark ? "oklch(0.96 0 0)" : "oklch(0.15 0.01 240)",
    text2: isDark ? "oklch(0.72 0.01 240)" : "oklch(0.45 0.01 240)",
    text3: isDark ? "oklch(0.52 0.01 240)" : "oklch(0.62 0.01 240)",
    blue: isDark ? "oklch(0.72 0.16 210)" : "oklch(0.52 0.22 250)",
    green: isDark ? "oklch(0.72 0.18 145)" : "oklch(0.48 0.2 145)",
    amber: isDark ? "oklch(0.82 0.18 80)" : "oklch(0.62 0.18 80)",
    red: isDark ? "oklch(0.72 0.18 25)" : "oklch(0.52 0.22 25)",
    cardBg: isDark ? "oklch(0.14 0.008 240)" : "oklch(0.975 0.004 80)",
    cardSel: isDark ? "oklch(0.72 0.16 210 / 0.08)" : "oklch(0.52 0.22 250 / 0.06)",
    shadow: isDark ? "0 8px 32px oklch(0 0 0 / 0.4)" : "0 8px 32px oklch(0 0 0 / 0.12)",
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const breakevenMeses = (totalInvestido: number, rendaMensal: number) => {
    if (rendaMensal <= 0) return null;
    const meses = Math.ceil(totalInvestido / rendaMensal);
    const anos = Math.floor(meses / 12);
    const mesesResto = meses % 12;
    return { meses, anos, mesesResto };
  };

  const toggleSelecao = (id: string) => {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const cenariosComparar = cenarios.filter(c => selecionados.includes(c.id));

  const metricasComparacao = [
    { label: "Renda líquida / mês", get: (c: Cenario) => formatCurrency(c.resultados.rendaMensalLiquida), color: (c: Cenario, all: Cenario[]) => {
      const max = Math.max(...all.map(x => x.resultados.rendaMensalLiquida));
      return c.resultados.rendaMensalLiquida === max ? colors.green : colors.text1;
    }},
    { label: "Renda líquida / ano", get: (c: Cenario) => formatCurrency(c.resultados.rendaMensalLiquida * 12), color: (c: Cenario, all: Cenario[]) => {
      const max = Math.max(...all.map(x => x.resultados.rendaMensalLiquida));
      return c.resultados.rendaMensalLiquida === max ? colors.green : colors.text1;
    }},
    { label: "Rentab. anual", get: (c: Cenario) => formatPercent(c.resultados.rentabilidadeAnual), color: (c: Cenario, all: Cenario[]) => {
      const max = Math.max(...all.map(x => x.resultados.rentabilidadeAnual));
      return c.resultados.rentabilidadeAnual === max ? colors.blue : colors.text1;
    }},
    { label: "Total investido", get: (c: Cenario) => formatCurrency(c.resultados.totalInvestido), color: (_c: Cenario) => colors.text1 },
    { label: "Financiamento", get: (c: Cenario) => formatCurrency(c.resultados.financiamento), color: (_c: Cenario) => colors.text1 },
    { label: "Valor do imóvel", get: (c: Cenario) => formatCurrency(c.resultados.valorImovel), color: (_c: Cenario) => colors.text1 },
    { label: "Breakeven", get: (c: Cenario) => {
      const bk = breakevenMeses(c.resultados.totalInvestido, c.resultados.rendaMensalLiquida);
      return bk ? `${bk.anos}a ${bk.mesesResto}m` : "—";
    }, color: (c: Cenario, all: Cenario[]) => {
      const bks = all.map(x => breakevenMeses(x.resultados.totalInvestido, x.resultados.rendaMensalLiquida)?.meses ?? Infinity);
      const min = Math.min(...bks);
      const bk = breakevenMeses(c.resultados.totalInvestido, c.resultados.rendaMensalLiquida);
      return bk && bk.meses === min ? colors.green : colors.text1;
    }},
    { label: "Diária", get: (c: Cenario) => formatCurrency(c.inputs.diaria), color: (_c: Cenario) => colors.text1 },
    { label: "Ocupação", get: (c: Cenario) => `${c.inputs.diasOcupacao} dias/mês`, color: (_c: Cenario) => colors.text1 },
  ];

  return (
    <>
      {/* Botão flutuante de histórico */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
        style={{
          background: isDark ? "oklch(0.72 0.16 210 / 0.15)" : "oklch(0.52 0.22 250 / 0.12)",
          border: `1px solid ${isDark ? "oklch(0.72 0.16 210 / 0.3)" : "oklch(0.52 0.22 250 / 0.3)"}`,
          color: colors.blue,
          backdropFilter: "blur(12px)",
          boxShadow: isDark ? "0 4px 24px oklch(0.72 0.16 210 / 0.15)" : "0 4px 24px oklch(0.52 0.22 250 / 0.1)",
          zIndex: 50,
        }}
        title="Histórico de cenários"
      >
        <History size={16} />
        <span>Histórico</span>
        {cenarios.length > 0 && (
          <span
            className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-black"
            style={{ background: colors.blue, color: isDark ? "oklch(0.04 0 0)" : "white" }}
          >
            {cenarios.length}
          </span>
        )}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setOpen(false); setModoComparar(false); setSelecionados([]); }}
              className="fixed inset-0"
              style={{ background: "oklch(0 0 0 / 0.5)", backdropFilter: "blur(4px)", zIndex: 60 }}
            />

            {/* Painel lateral */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 h-full flex flex-col"
              style={{
                width: modoComparar && selecionados.length >= 2 ? "min(900px, 100vw)" : "min(480px, 100vw)",
                background: colors.panel,
                borderLeft: `1px solid ${colors.border}`,
                boxShadow: colors.shadow,
                zIndex: 70,
                transition: "width 0.3s ease",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-5 shrink-0"
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: isDark ? "oklch(0.72 0.16 210 / 0.12)" : "oklch(0.52 0.22 250 / 0.1)", color: colors.blue }}
                  >
                    <History size={18} />
                  </div>
                  <div>
                    <div className="font-black text-base" style={{ color: colors.text1 }}>Histórico de Cenários</div>
                    <div className="text-xs" style={{ color: colors.text3 }}>
                      {cenarios.length === 0 ? "Nenhum cenário salvo" : `${cenarios.length} cenário${cenarios.length > 1 ? "s" : ""} salvo${cenarios.length > 1 ? "s" : ""}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {cenarios.length >= 2 && (
                    <button
                      onClick={() => { setModoComparar(!modoComparar); setSelecionados([]); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                      style={{
                        background: modoComparar
                          ? (isDark ? "oklch(0.72 0.16 210 / 0.2)" : "oklch(0.52 0.22 250 / 0.15)")
                          : (isDark ? "oklch(1 0 0 / 0.06)" : "oklch(0 0 0 / 0.05)"),
                        color: modoComparar ? colors.blue : colors.text2,
                        border: `1px solid ${modoComparar ? (isDark ? "oklch(0.72 0.16 210 / 0.3)" : "oklch(0.52 0.22 250 / 0.3)") : colors.border}`,
                      }}
                    >
                      <GitCompare size={12} />
                      {modoComparar ? "Cancelar" : "Comparar"}
                    </button>
                  )}
                  {cenarios.length > 0 && (
                    <button
                      onClick={() => { if (confirm("Limpar todo o histórico?")) { limparHistorico(); setSelecionados([]); } }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                      style={{ background: isDark ? "oklch(0.72 0.18 25 / 0.12)" : "oklch(0.52 0.22 25 / 0.08)", color: colors.red, border: `1px solid ${isDark ? "oklch(0.72 0.18 25 / 0.2)" : "oklch(0.52 0.22 25 / 0.15)"}` }}
                    >
                      <Trash2 size={12} />
                      Limpar
                    </button>
                  )}
                  <button
                    onClick={() => { setOpen(false); setModoComparar(false); setSelecionados([]); }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
                    style={{ background: isDark ? "oklch(1 0 0 / 0.06)" : "oklch(0 0 0 / 0.05)", color: colors.text2 }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modo comparação: instrução */}
              {modoComparar && (
                <div
                  className="px-6 py-3 text-xs font-medium shrink-0"
                  style={{
                    background: isDark ? "oklch(0.72 0.16 210 / 0.06)" : "oklch(0.52 0.22 250 / 0.05)",
                    borderBottom: `1px solid ${colors.border}`,
                    color: colors.blue,
                  }}
                >
                  {selecionados.length < 2
                    ? `Selecione 2 a 4 cenários para comparar (${selecionados.length} selecionado${selecionados.length !== 1 ? "s" : ""})`
                    : `${selecionados.length} cenários selecionados — tabela comparativa abaixo`}
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                {/* Tabela comparativa */}
                {modoComparar && selecionados.length >= 2 && (
                  <div className="px-4 pt-4 pb-2">
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{ border: `1px solid ${colors.border}` }}
                    >
                      {/* Header da tabela */}
                      <div
                        className="grid text-xs font-semibold"
                        style={{
                          gridTemplateColumns: `160px repeat(${cenariosComparar.length}, 1fr)`,
                          background: isDark ? "oklch(0.08 0.005 240)" : "oklch(0.94 0.006 240)",
                          borderBottom: `1px solid ${colors.border}`,
                        }}
                      >
                        <div className="px-3 py-2.5" style={{ color: colors.text3 }}>Métrica</div>
                        {cenariosComparar.map(c => (
                          <div key={c.id} className="px-2 py-2.5 text-center truncate" style={{ color: colors.blue }}>
                            {c.nome}
                          </div>
                        ))}
                      </div>
                      {/* Linhas */}
                      {metricasComparacao.map((m, i) => (
                        <div
                          key={m.label}
                          className="grid text-xs"
                          style={{
                            gridTemplateColumns: `160px repeat(${cenariosComparar.length}, 1fr)`,
                            background: i % 2 === 0
                              ? (isDark ? "oklch(0.12 0.006 240)" : "oklch(0.99 0.003 80)")
                              : (isDark ? "oklch(0.10 0.006 240)" : "oklch(0.975 0.004 80)"),
                            borderBottom: i < metricasComparacao.length - 1 ? `1px solid ${colors.border}` : "none",
                          }}
                        >
                          <div className="px-3 py-2" style={{ color: colors.text3 }}>{m.label}</div>
                          {cenariosComparar.map(c => (
                            <div
                              key={c.id}
                              className="px-2 py-2 text-center font-bold"
                              style={{ color: m.color(c, cenariosComparar), fontFamily: "'Geist Mono', monospace" }}
                            >
                              {m.get(c)}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs mt-2 mb-1 text-center" style={{ color: colors.text3 }}>
                      Valores em destaque indicam o melhor resultado em cada métrica
                    </div>
                  </div>
                )}

                {/* Lista de cenários */}
                <div className="px-4 py-4 space-y-3">
                  {cenarios.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: isDark ? "oklch(1 0 0 / 0.04)" : "oklch(0 0 0 / 0.04)", color: colors.text3 }}
                      >
                        <BookmarkPlus size={28} />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-sm mb-1" style={{ color: colors.text2 }}>Nenhum cenário salvo</div>
                        <div className="text-xs" style={{ color: colors.text3 }}>
                          Use o botão "Salvar cenário" na Calculadora<br />para guardar simulações aqui.
                        </div>
                      </div>
                    </div>
                  ) : (
                    cenarios.map((c) => {
                      const bk = breakevenMeses(c.resultados.totalInvestido, c.resultados.rendaMensalLiquida);
                      const isExpanded = expandido === c.id;
                      const isSelected = selecionados.includes(c.id);
                      return (
                        <motion.div
                          key={c.id}
                          layout
                          className="rounded-2xl overflow-hidden cursor-pointer"
                          onClick={() => modoComparar && toggleSelecao(c.id)}
                          style={{
                            background: isSelected ? colors.cardSel : colors.cardBg,
                            border: `1px solid ${isSelected ? (isDark ? "oklch(0.72 0.16 210 / 0.4)" : "oklch(0.52 0.22 250 / 0.35)") : colors.border}`,
                            transition: "background 0.15s, border-color 0.15s",
                          }}
                        >
                          {/* Card header */}
                          <div className="px-4 pt-4 pb-3">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {modoComparar && (
                                  <div style={{ color: isSelected ? colors.blue : colors.text3, flexShrink: 0 }}>
                                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-black text-sm truncate" style={{ color: colors.text1 }}>{c.nome}</div>
                                  <div className="text-xs mt-0.5" style={{ color: colors.text3 }}>{formatDate(c.criadoEm)}</div>
                                </div>
                              </div>
                              {!modoComparar && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onRestaurar(c); setOpen(false); }}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                                    style={{ background: isDark ? "oklch(0.72 0.16 210 / 0.12)" : "oklch(0.52 0.22 250 / 0.1)", color: colors.blue, border: `1px solid ${isDark ? "oklch(0.72 0.16 210 / 0.2)" : "oklch(0.52 0.22 250 / 0.2)"}` }}
                                    title="Restaurar este cenário"
                                  >
                                    <RotateCcw size={11} />
                                    Restaurar
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); duplicarCenario(c.id); }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                                    style={{ background: isDark ? "oklch(0.72 0.16 210 / 0.1)" : "oklch(0.52 0.22 250 / 0.07)", color: colors.blue }}
                                    title="Duplicar cenário"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); removerCenario(c.id); }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                                    style={{ background: isDark ? "oklch(0.72 0.18 25 / 0.1)" : "oklch(0.52 0.22 25 / 0.07)", color: colors.red }}
                                    title="Remover cenário"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* KPIs resumo */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-center">
                                <div className="text-xs mb-0.5" style={{ color: colors.text3 }}>Renda líquida</div>
                                <div className="text-sm font-black" style={{ color: colors.green, fontFamily: "'Geist Mono', monospace" }}>
                                  {formatCurrency(c.resultados.rendaMensalLiquida)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs mb-0.5" style={{ color: colors.text3 }}>Rentab. anual</div>
                                <div className="text-sm font-black" style={{ color: colors.blue, fontFamily: "'Geist Mono', monospace" }}>
                                  {formatPercent(c.resultados.rentabilidadeAnual)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs mb-0.5" style={{ color: colors.text3 }}>Breakeven</div>
                                <div className="text-sm font-black" style={{ color: colors.text1, fontFamily: "'Geist Mono', monospace" }}>
                                  {bk ? `${bk.anos}a ${bk.mesesResto}m` : "—"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expandir detalhes — só no modo normal */}
                          {!modoComparar && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); setExpandido(isExpanded ? null : c.id); }}
                                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs transition-all hover:opacity-70"
                                style={{ color: colors.text3, borderTop: `1px solid ${colors.border}` }}
                              >
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                {isExpanded ? "Menos detalhes" : "Ver detalhes"}
                              </button>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-4 pb-4 space-y-2" style={{ borderTop: `1px solid ${colors.border}` }}>
                                      <div className="pt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                        {[
                                          ["Valor do imóvel", formatCurrency(c.resultados.valorImovel)],
                                          ["Total investido", formatCurrency(c.resultados.totalInvestido)],
                                          ["Financiamento", formatCurrency(c.resultados.financiamento)],
                                          ["Diária", formatCurrency(c.inputs.diaria)],
                                          ["Ocupação", `${c.inputs.diasOcupacao} dias/mês`],
                                          ["Taxa juros", `${(c.inputs.taxaJurosMensal * 12).toFixed(1)}% a.a.`],
                                        ].map(([label, val]) => (
                                          <div key={label} className="flex justify-between gap-2">
                                            <span style={{ color: colors.text3 }}>{label}</span>
                                            <span className="font-semibold" style={{ color: colors.text2, fontFamily: "'Geist Mono', monospace" }}>{val}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
