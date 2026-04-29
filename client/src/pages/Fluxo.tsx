/**
 * Fluxo.tsx — Fluxo de Pagamento do Investimento
 * Tabela dinâmica: Ato (parcelado) | Mensais | Anuais | Decoração | Total Investido | Financiamento | Valor do Imóvel
 * Exportação como imagem PNG (template para relatório)
 */

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { useFluxo } from "@/contexts/FluxoContext";
import { formatCurrency, formatPercent } from "@/lib/calculator";
import {
  ChevronDown, ChevronUp, Download, Plus, Minus as MinusIcon,
  Calendar, Zap, BarChart3
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

// ─── Inline editable cell ─────────────────────────────────────────────────────
function EditableValue({
  value, onChange, prefix = "R$", small = false
}: { value: number; onChange: (v: number) => void; prefix?: string; small?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState("");

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return editing ? (
    <input
      autoFocus
      type="text"
      inputMode="decimal"
      value={raw}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={() => {
        const parsed = parseFloat(raw.replace(/\./g, "").replace(",", "."));
        if (!isNaN(parsed) && parsed >= 0) onChange(parsed);
        setEditing(false);
      }}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      className={`bg-transparent border-b outline-none text-center w-full ${small ? "text-xs" : "text-sm"}`}
      style={{ borderColor: "oklch(0.78 0.12 210 / 0.5)", color: "oklch(0.95 0 0)", fontFamily: "'Geist Mono', monospace" }}
    />
  ) : (
    <button
      onClick={() => { setEditing(true); setRaw(value.toString()); }}
      className={`w-full text-center transition-colors hover:opacity-70 ${small ? "text-xs" : "text-sm font-bold"}`}
      style={{ color: "oklch(0.95 0 0)", fontFamily: "'Geist Mono', monospace" }}
      title="Clique para editar"
    >
      {prefix && <span style={{ color: "oklch(0.6 0.01 240)", fontSize: "0.65em", marginRight: "2px" }}>{prefix}</span>}
      {fmt(value)}
    </button>
  );
}

function EditableMes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState("");
  return editing ? (
    <input
      autoFocus
      type="text"
      value={raw}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={() => { if (raw.trim()) onChange(raw.trim()); setEditing(false); }}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      className="bg-transparent border-b outline-none text-center w-full text-xs"
      style={{ borderColor: "oklch(0.78 0.12 210 / 0.5)", color: "oklch(0.78 0.12 210)", fontFamily: "'Geist Mono', monospace" }}
    />
  ) : (
    <button
      onClick={() => { setEditing(true); setRaw(value); }}
      className="w-full text-center text-xs transition-colors hover:opacity-70"
      style={{ color: "oklch(0.65 0.08 210)" }}
      title="Clique para editar"
    >
      ({value})
    </button>
  );
}

// ─── Table Cell ───────────────────────────────────────────────────────────────
function TCell({ children, header = false, green = false, blue = false, className = "" }: {
  children: React.ReactNode; header?: boolean; green?: boolean; blue?: boolean; className?: string;
}) {
  const bg = green
    ? "oklch(0.55 0.18 145 / 0.25)"
    : blue
    ? "oklch(0.78 0.12 210 / 0.12)"
    : header
    ? "oklch(0.78 0.12 210 / 0.08)"
    : "oklch(1 0 0 / 0.02)";
  const border = green
    ? "oklch(0.55 0.18 145 / 0.4)"
    : "oklch(1 0 0 / 0.08)";
  return (
    <td
      className={`px-2 py-2.5 text-center align-middle ${className}`}
      style={{ background: bg, borderRight: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}
    >
      {children}
    </td>
  );
}

function THead({ children, green = false, blue = false, colSpan = 1 }: {
  children: React.ReactNode; green?: boolean; blue?: boolean; colSpan?: number;
}) {
  const bg = green
    ? "oklch(0.55 0.18 145 / 0.35)"
    : blue
    ? "oklch(0.78 0.12 210 / 0.25)"
    : "oklch(0.78 0.12 210 / 0.15)";
  const color = green ? "oklch(0.85 0.18 145)" : blue ? "oklch(0.88 0.12 210)" : "oklch(0.88 0.12 210)";
  return (
    <th
      colSpan={colSpan}
      className="px-2 py-2.5 text-center text-xs font-black tracking-wider uppercase"
      style={{ background: bg, borderRight: "1px solid oklch(1 0 0 / 0.1)", borderBottom: "1px solid oklch(1 0 0 / 0.1)", color }}
    >
      {children}
    </th>
  );
}

// ─── Export template (para o PNG) ─────────────────────────────────────────────
function ExportTemplate({ fluxo, results }: { fluxo: ReturnType<typeof useFluxo>["fluxo"]; results: ReturnType<typeof useFluxo>["results"] }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0a0f1a 0%, #0d1520 100%)",
        padding: "48px 40px",
        fontFamily: "'Geist', 'Arial', sans-serif",
        minWidth: "900px",
      }}
    >
      <h2 style={{ color: "#fff", fontSize: "32px", fontWeight: 900, textAlign: "center", marginBottom: "32px", letterSpacing: "-0.5px" }}>
        Fluxo de <span style={{ color: "#3dd8e8" }}>pagamento</span>
      </h2>
      <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: "12px", overflow: "hidden" }}>
        <thead>
          <tr>
            {fluxo.ato.map((p) => (
              <th key={p.label} style={{ background: "#1a9fc7", color: "#fff", padding: "14px 10px", fontSize: "13px", fontWeight: 800, textAlign: "center", border: "1px solid #0d7a9a", textTransform: "uppercase" }}>
                {p.label}<br /><span style={{ fontWeight: 400, fontSize: "11px" }}>({p.mes})</span>
              </th>
            ))}
            <th style={{ background: "#1a9fc7", color: "#fff", padding: "14px 10px", fontSize: "13px", fontWeight: 800, textAlign: "center", border: "1px solid #0d7a9a" }}>
              {fluxo.numMensais} MENSAIS
            </th>
            {fluxo.anuais.map((a, i) => (
              <th key={i} style={{ background: "#1a9fc7", color: "#fff", padding: "14px 10px", fontSize: "13px", fontWeight: 800, textAlign: "center", border: "1px solid #0d7a9a" }}>
                ANUAL {i + 1}<br /><span style={{ fontWeight: 400, fontSize: "11px" }}>({a.mes})</span>
              </th>
            ))}
            <th style={{ background: "#1a9fc7", color: "#fff", padding: "14px 10px", fontSize: "13px", fontWeight: 800, textAlign: "center", border: "1px solid #0d7a9a" }}>
              +DECORAÇÃO
            </th>
            <th style={{ background: "#16a34a", color: "#fff", padding: "14px 10px", fontSize: "13px", fontWeight: 800, textAlign: "center", border: "1px solid #15803d" }}>
              TOTAL<br />INVESTIDO
            </th>
            <th style={{ background: "#1a9fc7", color: "#fff", padding: "14px 10px", fontSize: "13px", fontWeight: 800, textAlign: "center", border: "1px solid #0d7a9a" }}>
              FINANCIAMENTO
            </th>
            <th style={{ background: "#1a9fc7", color: "#fff", padding: "14px 10px", fontSize: "13px", fontWeight: 800, textAlign: "center", border: "1px solid #0d7a9a" }}>
              VALOR<br />DO IMÓVEL
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {fluxo.ato.map((p) => (
              <td key={p.label} style={{ background: "#fff", padding: "20px 10px", fontSize: "16px", fontWeight: 700, textAlign: "center", border: "1px solid #e2e8f0", fontStyle: p.label === "ATO" ? "italic" : "normal" }}>
                {p.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}
              </td>
            ))}
            <td style={{ background: "#fff", padding: "20px 10px", fontSize: "16px", fontWeight: 700, textAlign: "center", border: "1px solid #e2e8f0" }}>
              {fluxo.valorMensal.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}
            </td>
            {fluxo.anuais.map((a, i) => (
              <td key={i} style={{ background: "#fff", padding: "20px 10px", fontSize: "16px", fontWeight: 700, textAlign: "center", border: "1px solid #e2e8f0" }}>
                {a.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}
              </td>
            ))}
            <td style={{ background: "#fff", padding: "20px 10px", fontSize: "16px", fontWeight: 700, textAlign: "center", border: "1px solid #e2e8f0" }}>
              {fluxo.decoracao.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}
            </td>
            <td style={{ background: "#dcfce7", padding: "20px 10px", fontSize: "16px", fontWeight: 900, textAlign: "center", border: "1px solid #86efac", color: "#15803d" }}>
              {results.totalInvestido.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}
            </td>
            <td style={{ background: "#fff", padding: "20px 10px", fontSize: "16px", fontWeight: 700, textAlign: "center", border: "1px solid #e2e8f0" }}>
              {results.financiamento.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}
            </td>
            <td style={{ background: "#fff", padding: "20px 10px", fontSize: "16px", fontWeight: 700, textAlign: "center", border: "1px solid #e2e8f0" }}>
              {fluxo.valorImovel.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}
            </td>
          </tr>
        </tbody>
      </table>
      <p style={{ color: "#4a5568", fontSize: "11px", textAlign: "center", marginTop: "16px" }}>
        Calculadora Short Stay · Os valores são estimativas e não constituem assessoria financeira.
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FluxoPage() {
  const { fluxo, results, updateAto, updateParcelaAtoMes, updateParcelaAtoValor,
    updateAnualMes, updateAnualValor, addAnual, removeAnual, setFluxo } = useFluxo();

  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: "#0a0f1a",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = "fluxo-pagamento.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(false);
    }
  }, []);

  const pctInvestido = fluxo.valorImovel > 0
    ? (results.totalInvestido / fluxo.valorImovel) * 100 : 0;
  const pctFinanciamento = 100 - pctInvestido;

  return (
    <div className="min-h-screen pb-16" style={{ fontFamily: "'Geist', sans-serif" }}>

      {/* Hero */}
      <section className="px-4 md:px-6 pt-8 pb-6 text-center max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "oklch(0.78 0.12 210 / 0.08)", border: "1px solid oklch(0.78 0.12 210 / 0.2)", color: "oklch(0.78 0.12 210)" }}>
            <Calendar size={11} /> Fluxo de Pagamento
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3" style={{ color: "#fff" }}>
            Estruture o{" "}
            <span style={{ color: "oklch(0.78 0.15 210)", textShadow: "0 0 40px oklch(0.78 0.15 210 / 0.5)" }}>
              investimento
            </span>
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.65 0.01 240)" }}>
            Configure o fluxo de pagamento e veja como o capital se distribui entre investimento próprio e financiamento.
          </p>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-4">

        {/* ── CONTROLES ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
          className="rounded-2xl p-4 md:p-5"
          style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.08)" }}>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "oklch(0.78 0.12 210 / 0.12)", color: "oklch(0.78 0.12 210)" }}>
              <Zap size={13} />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "oklch(0.78 0.12 210)" }}>Configurações</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">

            {/* Ato % */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: "oklch(0.6 0.01 240)" }}>% do Ato</label>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: "oklch(0.78 0.12 210 / 0.1)", color: "oklch(0.78 0.12 210)", fontFamily: "'Geist Mono', monospace" }}>
                  {fluxo.percentualAto.toFixed(2)}%
                </span>
              </div>
              <Slider min={9.8} max={30} step={0.1} value={[fluxo.percentualAto]}
                onValueChange={([v]) => updateAto(v, fluxo.parcelasAto)} />
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: "oklch(0.35 0.01 240)" }}>9,8%</span>
                <span className="text-xs" style={{ color: "oklch(0.35 0.01 240)" }}>30%</span>
              </div>
            </div>

            {/* Parcelas do Ato */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: "oklch(0.6 0.01 240)" }}>Parcelas do Ato</label>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: "oklch(0.78 0.12 210 / 0.1)", color: "oklch(0.78 0.12 210)", fontFamily: "'Geist Mono', monospace" }}>
                  {fluxo.parcelasAto}x
                </span>
              </div>
              <Slider min={1} max={4} step={1} value={[fluxo.parcelasAto]}
                onValueChange={([v]) => updateAto(fluxo.percentualAto, v)} />
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: "oklch(0.35 0.01 240)" }}>1x</span>
                <span className="text-xs" style={{ color: "oklch(0.35 0.01 240)" }}>4x</span>
              </div>
            </div>

            {/* Mensais */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: "oklch(0.6 0.01 240)" }}>Nº de Mensais</label>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: "oklch(0.78 0.12 210 / 0.1)", color: "oklch(0.78 0.12 210)", fontFamily: "'Geist Mono', monospace" }}>
                  {fluxo.numMensais} meses
                </span>
              </div>
              <Slider min={25} max={37} step={1} value={[fluxo.numMensais]}
                onValueChange={([v]) => setFluxo((p) => ({ ...p, numMensais: v }))} />
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: "oklch(0.35 0.01 240)" }}>25</span>
                <span className="text-xs" style={{ color: "oklch(0.35 0.01 240)" }}>37</span>
              </div>
            </div>

            {/* Anuais */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: "oklch(0.6 0.01 240)" }}>Parcelas Anuais</label>
                <div className="flex items-center gap-1">
                  <button onClick={removeAnual} disabled={fluxo.anuais.length <= 1}
                    className="w-5 h-5 rounded-md flex items-center justify-center transition-colors disabled:opacity-30"
                    style={{ background: "oklch(0.65 0.22 25 / 0.15)", color: "oklch(0.65 0.22 25)" }}>
                    <MinusIcon size={11} />
                  </button>
                  <span className="text-xs font-bold px-2" style={{ color: "oklch(0.78 0.12 210)", fontFamily: "'Geist Mono', monospace" }}>
                    {fluxo.anuais.length}x
                  </span>
                  <button onClick={addAnual} disabled={fluxo.anuais.length >= 3}
                    className="w-5 h-5 rounded-md flex items-center justify-center transition-colors disabled:opacity-30"
                    style={{ background: "oklch(0.72 0.18 145 / 0.15)", color: "oklch(0.72 0.18 145)" }}>
                    <Plus size={11} />
                  </button>
                </div>
              </div>
              <div className="text-xs py-2 px-3 rounded-xl" style={{ background: "oklch(1 0 0 / 0.03)", color: "oklch(0.55 0.01 240)" }}>
                {fluxo.anuais.length} parcela{fluxo.anuais.length > 1 ? "s" : ""} anual{fluxo.anuais.length > 1 ? "is" : ""} — edite mês e valor na tabela
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── TABELA ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid oklch(1 0 0 / 0.1)" }}>

          <div className="flex items-center justify-between px-4 py-3"
            style={{ background: "oklch(1 0 0 / 0.04)", borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: "oklch(0.78 0.12 210 / 0.12)", color: "oklch(0.78 0.12 210)" }}>
                <BarChart3 size={13} />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "oklch(0.78 0.12 210)" }}>
                Fluxo de Pagamento
              </span>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: "oklch(0.78 0.12 210 / 0.12)", border: "1px solid oklch(0.78 0.12 210 / 0.25)", color: "oklch(0.78 0.12 210)" }}>
              <Download size={12} />
              {exporting ? "Gerando..." : "Exportar PNG"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr>
                  {/* Ato parcelas */}
                  {fluxo.ato.map((p) => (
                    <THead key={p.label} blue>
                      <div className="font-black">{p.label}</div>
                      <EditableMes value={p.mes} onChange={(v) => updateParcelaAtoMes(fluxo.ato.indexOf(p), v)} />
                    </THead>
                  ))}
                  {/* Mensais */}
                  <THead blue>
                    <div className="font-black">{fluxo.numMensais} MENSAIS</div>
                    <div className="text-xs font-normal opacity-70">por parcela</div>
                  </THead>
                  {/* Anuais */}
                  {fluxo.anuais.map((a, i) => (
                    <THead key={i} blue>
                      <div className="font-black">{fluxo.anuais.length}X ANUAIS {i + 1}</div>
                      <EditableMes value={a.mes} onChange={(v) => updateAnualMes(i, v)} />
                    </THead>
                  ))}
                  {/* Decoração */}
                  <THead blue>
                    <div className="font-black">+DECORAÇÃO</div>
                    <div className="text-xs font-normal opacity-70">(opcional)</div>
                  </THead>
                  {/* Total Investido */}
                  <THead green>
                    <div className="font-black">TOTAL</div>
                    <div className="font-black">INVESTIDO</div>
                  </THead>
                  {/* Financiamento */}
                  <THead blue>
                    <div className="font-black">FINANCIAMENTO</div>
                  </THead>
                  {/* Valor do Imóvel */}
                  <THead blue>
                    <div className="font-black">VALOR</div>
                    <div className="font-black">DO IMÓVEL</div>
                  </THead>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* Valores do Ato */}
                  {fluxo.ato.map((p, i) => (
                    <TCell key={p.label}>
                      <EditableValue value={p.valor} onChange={(v) => updateParcelaAtoValor(i, v)} />
                    </TCell>
                  ))}
                  {/* Mensal */}
                  <TCell>
                    <EditableValue
                      value={fluxo.valorMensal}
                      onChange={(v) => setFluxo((p) => ({ ...p, valorMensal: v }))}
                    />
                    <div className="text-xs mt-0.5" style={{ color: "oklch(0.5 0.01 240)" }}>
                      = {formatCurrency(results.totalMensais)} total
                    </div>
                  </TCell>
                  {/* Anuais */}
                  {fluxo.anuais.map((a, i) => (
                    <TCell key={i}>
                      <EditableValue value={a.valor} onChange={(v) => updateAnualValor(i, v)} />
                    </TCell>
                  ))}
                  {/* Decoração */}
                  <TCell>
                    <EditableValue
                      value={fluxo.decoracao}
                      onChange={(v) => setFluxo((p) => ({ ...p, decoracao: v }))}
                    />
                  </TCell>
                  {/* Total Investido */}
                  <TCell green>
                    <div className="text-sm font-black" style={{ color: "oklch(0.75 0.2 145)", fontFamily: "'Geist Mono', monospace" }}>
                      {formatCurrency(results.totalInvestido)}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "oklch(0.6 0.15 145)" }}>
                      {pctInvestido.toFixed(1)}% do imóvel
                    </div>
                  </TCell>
                  {/* Financiamento */}
                  <TCell>
                    <div className="text-sm font-bold" style={{ color: "oklch(0.78 0.12 210)", fontFamily: "'Geist Mono', monospace" }}>
                      {formatCurrency(results.financiamento)}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "oklch(0.5 0.01 240)" }}>
                      {pctFinanciamento.toFixed(1)}% do imóvel
                    </div>
                  </TCell>
                  {/* Valor do Imóvel */}
                  <TCell>
                    <div className="text-sm font-bold" style={{ color: "oklch(0.85 0 0)", fontFamily: "'Geist Mono', monospace" }}>
                      {formatCurrency(fluxo.valorImovel)}
                    </div>
                  </TCell>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── DISTRIBUIÇÃO VISUAL ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl p-4 md:p-5"
          style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.08)" }}>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "oklch(0.72 0.18 145 / 0.12)", color: "oklch(0.72 0.18 145)" }}>
              <BarChart3 size={13} />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "oklch(0.72 0.18 145)" }}>Distribuição do Capital</span>
          </div>

          {/* Barra de distribuição */}
          <div className="h-8 rounded-xl overflow-hidden flex mb-3" style={{ border: "1px solid oklch(1 0 0 / 0.08)" }}>
            <motion.div
              animate={{ width: `${pctInvestido}%` }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="h-full flex items-center justify-center text-xs font-bold"
              style={{ background: "oklch(0.55 0.18 145 / 0.7)", color: "#fff", minWidth: pctInvestido > 10 ? "auto" : 0 }}
            >
              {pctInvestido > 8 && `${pctInvestido.toFixed(1)}%`}
            </motion.div>
            <motion.div
              animate={{ width: `${pctFinanciamento}%` }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="h-full flex items-center justify-center text-xs font-bold"
              style={{ background: "oklch(0.78 0.12 210 / 0.5)", color: "#fff" }}
            >
              {pctFinanciamento > 8 && `${pctFinanciamento.toFixed(1)}%`}
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Investido", value: results.totalInvestido, color: "oklch(0.72 0.18 145)", sub: `${pctInvestido.toFixed(1)}% do imóvel` },
              { label: "Financiamento", value: results.financiamento, color: "oklch(0.78 0.12 210)", sub: `${pctFinanciamento.toFixed(1)}% do imóvel` },
              { label: "Valor do Imóvel", value: fluxo.valorImovel, color: "oklch(0.85 0 0)", sub: "base de cálculo" },
              { label: "Ato Total", value: results.totalAto, color: "oklch(0.78 0.18 70)", sub: `${fluxo.percentualAto.toFixed(2)}% — ${fluxo.parcelasAto}x` },
            ].map(({ label, value, color, sub }) => (
              <div key={label} className="rounded-xl p-3" style={{ background: "oklch(1 0 0 / 0.03)" }}>
                <div className="text-xs mb-1" style={{ color: "oklch(0.5 0.01 240)" }}>{label}</div>
                <div className="text-base font-black" style={{ color, fontFamily: "'Geist Mono', monospace" }}>{formatCurrency(value)}</div>
                <div className="text-xs mt-0.5" style={{ color: "oklch(0.42 0.01 240)" }}>{sub}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-3 text-xs" style={{ color: "oklch(0.42 0.01 240)" }}>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: "oklch(0.55 0.18 145 / 0.7)" }} />
              Investimento próprio (base do ROI)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: "oklch(0.78 0.12 210 / 0.5)" }} />
              Financiamento bancário
            </div>
          </div>
        </motion.div>

        {/* Nota sobre ROI */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="rounded-xl px-4 py-3 text-xs"
          style={{ background: "oklch(0.72 0.18 145 / 0.05)", border: "1px solid oklch(0.72 0.18 145 / 0.15)", color: "oklch(0.6 0.1 145)" }}>
          <strong>ROI calculado sobre o Total Investido ({formatCurrency(results.totalInvestido)}).</strong>{" "}
          O financiamento ({formatCurrency(results.financiamento)}) é atualizado automaticamente na calculadora principal como "Saldo a Financiar".
        </motion.div>
      </div>

      {/* Template oculto para exportação */}
      <div style={{ position: "absolute", left: "-9999px", top: 0, pointerEvents: "none" }}>
        <div ref={exportRef}>
          <ExportTemplate fluxo={fluxo} results={results} />
        </div>
      </div>
    </div>
  );
}
