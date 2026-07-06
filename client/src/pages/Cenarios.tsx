/**
 * Cenarios.tsx — página de cenários salvos (terceira aba)
 * Design brochure Vitacon: preto #000, cartões #1A1A1A, azul puro #2800FF.
 * Restaurar aplica calc + fluxo + nome direto no FluxoContext e navega à Calculadora.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  History, X, RotateCcw, Copy, GitCompare, CheckSquare, Square,
  Trash2, BookmarkPlus, Calculator,
} from "lucide-react";
import { toast } from "sonner";
import { useCenarios, type Cenario } from "@/contexts/CenariosContext";
import { useFluxo } from "@/contexts/FluxoContext";
import { useVitaconColors } from "@/lib/vitaconColors";
import { formatCurrency, formatPercent, defaultInputs } from "@/lib/calculator";

const EASE = [0.23, 1, 0.32, 1] as const;

function breakevenMeses(totalInvestido: number, rendaMensal: number) {
  if (rendaMensal <= 0) return null;
  const meses = Math.ceil(totalInvestido / rendaMensal);
  return { meses, anos: Math.floor(meses / 12), mesesResto: meses % 12 };
}

export default function CenariosPage() {
  const colors = useVitaconColors(true);
  const { cenarios, removerCenario, duplicarCenario, limparHistorico } = useCenarios();
  const { setCalc, setFluxo, setNomeEmpreendimento } = useFluxo();
  const [, navigate] = useLocation();
  const [modoComparar, setModoComparar] = useState(false);
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const restaurar = (c: Cenario) => {
    setCalc(() => ({ ...defaultInputs, ...c.inputs }));
    if (c.fluxo) setFluxo(() => ({ ...c.fluxo }));
    if (c.nomeEmpreendimento !== undefined) setNomeEmpreendimento(c.nomeEmpreendimento);
    toast.success(`Cenário "${c.nome}" restaurado!`, { description: "Valores aplicados na Calculadora." });
    navigate("/");
  };

  const toggleSelecao = (id: string) => {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const comparar = cenarios.filter(c => selecionados.includes(c.id));

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const metricas = [
    { label: "Renda líquida / mês", get: (c: Cenario) => formatCurrency(c.resultados.rendaMensalLiquida),
      best: (all: Cenario[]) => Math.max(...all.map(x => x.resultados.rendaMensalLiquida)),
      val: (c: Cenario) => c.resultados.rendaMensalLiquida },
    { label: "Renda líquida / ano", get: (c: Cenario) => formatCurrency(c.resultados.rendaMensalLiquida * 12),
      best: (all: Cenario[]) => Math.max(...all.map(x => x.resultados.rendaMensalLiquida)),
      val: (c: Cenario) => c.resultados.rendaMensalLiquida },
    { label: "Rentabilidade anual", get: (c: Cenario) => formatPercent(c.resultados.rentabilidadeAnual),
      best: (all: Cenario[]) => Math.max(...all.map(x => x.resultados.rentabilidadeAnual)),
      val: (c: Cenario) => c.resultados.rentabilidadeAnual },
    { label: "Total investido", get: (c: Cenario) => formatCurrency(c.resultados.totalInvestido) },
    { label: "Financiamento", get: (c: Cenario) => formatCurrency(c.resultados.financiamento) },
    { label: "Valor do imóvel", get: (c: Cenario) => formatCurrency(c.resultados.valorImovel) },
    { label: "Diária", get: (c: Cenario) => formatCurrency(c.inputs.diaria) },
    { label: "Ocupação", get: (c: Cenario) => `${c.inputs.diasOcupacao} dias/mês` },
  ] as const;

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header brochure */}
        <div className="mb-6 md:mb-8 rise">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px]" style={{ background: colors.blue }} />
            <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>
              Simulações salvas
            </span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1
              className="text-3xl md:text-5xl font-black uppercase leading-none"
              style={{ color: colors.text1, fontFamily: "var(--font-display)", letterSpacing: "0.01em" }}
            >
              Cenários
            </h1>
            {cenarios.length > 0 && (
              <div className="flex items-center gap-2">
                {cenarios.length >= 2 && (
                  <button
                    onClick={() => { setModoComparar(!modoComparar); setSelecionados([]); }}
                    className="press flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
                    style={{
                      background: modoComparar ? colors.blue : colors.inputBg,
                      color: modoComparar ? "#FFFFFF" : colors.text2,
                      border: `1px solid ${modoComparar ? colors.blue : colors.border}`,
                    }}
                  >
                    <GitCompare size={13} />
                    {modoComparar ? "Cancelar comparação" : "Comparar"}
                  </button>
                )}
                <button
                  onClick={() => { if (confirm("Limpar todos os cenários salvos?")) { limparHistorico(); setSelecionados([]); } }}
                  className="press flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: colors.redBg, color: colors.red, border: `1px solid ${colors.redBorder}` }}
                >
                  <Trash2 size={13} />
                  Limpar
                </button>
              </div>
            )}
          </div>
          <p className="text-xs mt-2" style={{ color: colors.text4 }}>
            {cenarios.length === 0
              ? "Nenhum cenário salvo ainda."
              : modoComparar
                ? `Selecione 2 a 4 cenários para comparar — ${selecionados.length} selecionado${selecionados.length !== 1 ? "s" : ""}.`
                : `${cenarios.length} cenário${cenarios.length > 1 ? "s" : ""} salvo${cenarios.length > 1 ? "s" : ""} neste navegador.`}
          </p>
        </div>

        {/* Vazio */}
        {cenarios.length === 0 && (
          <div
            className="rise flex flex-col items-center gap-4 py-20 rounded-2xl"
            style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: colors.blueBg, color: colors.blue }}>
              <BookmarkPlus size={24} />
            </div>
            <div className="text-center px-6">
              <div className="font-bold text-sm mb-1" style={{ color: colors.text1 }}>Nenhum cenário salvo</div>
              <div className="text-xs leading-relaxed" style={{ color: colors.text3 }}>
                Monte uma simulação na Calculadora e toque em "Salvar cenário"<br className="hidden md:block" /> para guardá-la aqui.
              </div>
            </div>
            <button
              onClick={() => navigate("/")}
              className="press flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: colors.blue, color: "#FFFFFF" }}
            >
              <Calculator size={14} />
              Ir para a Calculadora
            </button>
          </div>
        )}

        {/* Tabela comparativa */}
        <AnimatePresence>
          {modoComparar && comparar.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="mb-6 rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${colors.border}` }}
            >
              <div className="overflow-x-auto">
                <div style={{ minWidth: 160 + comparar.length * 140 }}>
                  <div
                    className="grid text-xs font-semibold"
                    style={{
                      gridTemplateColumns: `160px repeat(${comparar.length}, 1fr)`,
                      background: "#0A0A0A",
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <div className="px-4 py-3" style={{ color: colors.text4 }}>Métrica</div>
                    {comparar.map(c => (
                      <div key={c.id} className="px-2 py-3 text-center truncate" style={{ color: colors.blue }}>{c.nome}</div>
                    ))}
                  </div>
                  {metricas.map((m, i) => (
                    <div
                      key={m.label}
                      className="grid text-xs"
                      style={{
                        gridTemplateColumns: `160px repeat(${comparar.length}, 1fr)`,
                        background: i % 2 === 0 ? colors.surface : "#151515",
                        borderBottom: i < metricas.length - 1 ? `1px solid ${colors.divider}` : "none",
                      }}
                    >
                      <div className="px-4 py-2.5" style={{ color: colors.text3 }}>{m.label}</div>
                      {comparar.map(c => {
                        const destaque = "best" in m && m.best && m.val && m.val(c) === m.best(comparar) && m.val(c) > 0;
                        return (
                          <div
                            key={c.id}
                            className="px-2 py-2.5 text-center font-bold"
                            style={{ color: destaque ? colors.green : colors.text1, fontFamily: "var(--font-mono)" }}
                          >
                            {m.get(c)}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[10px] py-2 text-center" style={{ color: colors.text4, background: "#0A0A0A" }}>
                Valores em verde indicam o melhor resultado em cada métrica
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid de cartões */}
        <div className="grid md:grid-cols-2 gap-3 md:gap-4">
          {cenarios.map((c, i) => {
            const bk = breakevenMeses(c.resultados.totalInvestido, c.resultados.rendaMensalLiquida);
            const isSelected = selecionados.includes(c.id);
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: Math.min(i * 0.05, 0.3) }}
                onClick={() => modoComparar && toggleSelecao(c.id)}
                className="rounded-2xl p-4 md:p-5"
                style={{
                  background: isSelected ? colors.blueBg : colors.surface,
                  border: `1px solid ${isSelected ? colors.blue : colors.border}`,
                  cursor: modoComparar ? "pointer" : "default",
                  transition: "background 0.2s, border-color 0.2s",
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {modoComparar && (
                      <span style={{ color: isSelected ? colors.blue : colors.text4 }}>
                        {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="font-black text-sm truncate" style={{ color: colors.text1 }}>{c.nome}</div>
                      <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>
                        {c.nomeEmpreendimento ? `${c.nomeEmpreendimento} · ` : ""}{formatDate(c.criadoEm)}
                      </div>
                    </div>
                  </div>
                  {!modoComparar && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => duplicarCenario(c.id)}
                        className="press w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: colors.inputBg, color: colors.text3, border: `1px solid ${colors.border}` }}
                        title="Duplicar"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => removerCenario(c.id)}
                        className="press w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: colors.redBg, color: colors.red, border: `1px solid ${colors.redBorder}` }}
                        title="Excluir"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Renda / mês", value: formatCurrency(c.resultados.rendaMensalLiquida), color: colors.green },
                    { label: "Rentab. anual", value: formatPercent(c.resultados.rentabilidadeAnual), color: colors.blue },
                    { label: "Breakeven", value: bk ? `${bk.anos}a ${bk.mesesResto}m` : "—", color: colors.text1 },
                  ].map(kpi => (
                    <div key={kpi.label} className="rounded-xl px-2.5 py-2.5" style={{ background: colors.inputBg }}>
                      <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>
                        {kpi.label}
                      </div>
                      <div className="text-xs md:text-sm font-black truncate" style={{ color: kpi.color, fontFamily: "var(--font-mono)" }}>
                        {kpi.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detalhes compactos */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] mb-4">
                  {[
                    ["Valor do imóvel", formatCurrency(c.resultados.valorImovel)],
                    ["Total investido", formatCurrency(c.resultados.totalInvestido)],
                    ["Financiamento", formatCurrency(c.resultados.financiamento)],
                    ["Diária × ocupação", `${formatCurrency(c.inputs.diaria)} × ${c.inputs.diasOcupacao}d`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span style={{ color: colors.text4 }}>{label}</span>
                      <span className="font-semibold" style={{ color: colors.text2, fontFamily: "var(--font-mono)" }}>{val}</span>
                    </div>
                  ))}
                </div>

                {!modoComparar && (
                  <button
                    onClick={() => restaurar(c)}
                    className="press w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                    style={{ background: colors.blue, color: "#FFFFFF", fontFamily: "var(--font-display)" }}
                  >
                    <RotateCcw size={13} />
                    Restaurar na Calculadora
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Rodapé */}
        {cenarios.length > 0 && (
          <div className="flex items-center gap-2 mt-8 justify-center">
            <History size={11} style={{ color: colors.text4 }} />
            <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>
              Salvos localmente neste navegador · máx. 20
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
