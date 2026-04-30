/**
 * Fluxo.tsx — Fluxo de Pagamento do Investimento
 * Dual theme: Dark Cosmos / Slate Premium
 * Exportação PNG via Canvas API nativa (sem html2canvas)
 */
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useFluxo } from "@/contexts/FluxoContext";
import { useTheme } from "@/contexts/ThemeContext";
import { formatCurrency } from "@/lib/calculator";
import { Download, Plus, Minus as MinusIcon, BarChart3, Zap } from "lucide-react";
import { Slider } from "@/components/ui/slider";

function useColors(isDark: boolean) {
  return {
    surface: isDark ? "oklch(1 0 0 / 0.04)" : "oklch(1 0 0)",
    border: isDark ? "oklch(1 0 0 / 0.09)" : "oklch(0.88 0.008 240)",
    divider: isDark ? "oklch(1 0 0 / 0.07)" : "oklch(0.9 0.006 240)",
    inputBg: isDark ? "oklch(1 0 0 / 0.04)" : "oklch(0.96 0.005 240)",
    text1: isDark ? "oklch(0.97 0 0)" : "oklch(0.18 0.01 260)",
    text2: isDark ? "oklch(0.75 0 0)" : "oklch(0.35 0.01 260)",
    text3: isDark ? "oklch(0.55 0.01 240)" : "oklch(0.52 0.01 260)",
    text4: isDark ? "oklch(0.38 0.01 240)" : "oklch(0.65 0.01 260)",
    blue: isDark ? "oklch(0.78 0.12 210)" : "oklch(0.52 0.22 250)",
    blueBg: isDark ? "oklch(0.78 0.12 210 / 0.08)" : "oklch(0.52 0.22 250 / 0.07)",
    blueBorder: isDark ? "oklch(0.78 0.12 210 / 0.2)" : "oklch(0.52 0.22 250 / 0.25)",
    blueHead: isDark ? "oklch(0.78 0.12 210 / 0.18)" : "oklch(0.52 0.22 250 / 0.12)",
    blueCell: isDark ? "oklch(0.78 0.12 210 / 0.04)" : "oklch(0.52 0.22 250 / 0.03)",
    green: isDark ? "oklch(0.72 0.18 145)" : "oklch(0.48 0.18 145)",
    greenBg: isDark ? "oklch(0.72 0.18 145 / 0.08)" : "oklch(0.48 0.18 145 / 0.07)",
    greenBorder: isDark ? "oklch(0.72 0.18 145 / 0.2)" : "oklch(0.48 0.18 145 / 0.25)",
    greenHead: isDark ? "oklch(0.55 0.18 145 / 0.35)" : "oklch(0.48 0.18 145 / 0.15)",
    greenCell: isDark ? "oklch(0.55 0.18 145 / 0.15)" : "oklch(0.48 0.18 145 / 0.08)",
    amber: isDark ? "oklch(0.78 0.18 70)" : "oklch(0.6 0.18 70)",
    amberBg: isDark ? "oklch(0.78 0.18 70 / 0.08)" : "oklch(0.6 0.18 70 / 0.07)",
    mono: isDark ? "oklch(0.95 0 0)" : "oklch(0.18 0.01 260)",
    cardShadow: isDark ? "none" : "0 1px 3px oklch(0 0 0 / 0.06), 0 4px 16px oklch(0 0 0 / 0.05)",
  };
}

function EditableValue({ value, onChange, prefix = "R$", colors }: {
  value: number; onChange: (v: number) => void; prefix?: string;
  colors: ReturnType<typeof useColors>;
}) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState("");
  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return editing ? (
    <input autoFocus type="text" inputMode="decimal" value={raw}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={() => {
        const parsed = parseFloat(raw.replace(/\./g, "").replace(",", "."));
        if (!isNaN(parsed) && parsed >= 0) onChange(parsed);
        setEditing(false);
      }}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      className="bg-transparent border-b outline-none text-center w-full text-sm"
      style={{ borderColor: colors.blue, color: colors.mono, fontFamily: "'Geist Mono', monospace" }}
    />
  ) : (
    <button onClick={() => { setEditing(true); setRaw(value.toString()); }}
      className="w-full text-center transition-opacity hover:opacity-70 text-sm font-bold"
      style={{ color: colors.mono, fontFamily: "'Geist Mono', monospace" }} title="Clique para editar">
      {prefix && <span style={{ color: colors.text3, fontSize: "0.65em", marginRight: "2px" }}>{prefix}</span>}
      {fmt(value)}
    </button>
  );
}

function EditableMes({ value, onChange, colors }: {
  value: string; onChange: (v: string) => void; colors: ReturnType<typeof useColors>;
}) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState("");
  return editing ? (
    <input autoFocus type="text" value={raw}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={() => { if (raw.trim()) onChange(raw.trim()); setEditing(false); }}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      className="bg-transparent border-b outline-none text-center w-full text-xs"
      style={{ borderColor: colors.blue, color: colors.blue, fontFamily: "'Geist Mono', monospace" }}
    />
  ) : (
    <button onClick={() => { setEditing(true); setRaw(value); }}
      className="w-full text-center text-xs transition-opacity hover:opacity-70"
      style={{ color: colors.text3 }} title="Clique para editar">
      ({value})
    </button>
  );
}

function THead({ children, green = false, colors }: {
  children: React.ReactNode; green?: boolean; colors: ReturnType<typeof useColors>;
}) {
  return (
    <th className="px-2 py-2.5 text-center text-xs font-black tracking-wider uppercase"
      style={{
        background: green ? colors.greenHead : colors.blueHead,
        borderRight: `1px solid ${colors.divider}`,
        borderBottom: `1px solid ${colors.divider}`,
        color: green ? colors.green : colors.blue,
      }}>
      {children}
    </th>
  );
}

function TCell({ children, green = false, colors }: {
  children: React.ReactNode; green?: boolean; colors: ReturnType<typeof useColors>;
}) {
  return (
    <td className="px-2 py-2.5 text-center align-middle"
      style={{
        background: green ? colors.greenCell : colors.blueCell,
        borderRight: `1px solid ${colors.divider}`,
        borderBottom: `1px solid ${colors.divider}`,
      }}>
      {children}
    </td>
  );
}

function exportFluxoPNG(
  fluxo: ReturnType<typeof useFluxo>["fluxo"],
  results: ReturnType<typeof useFluxo>["results"],
  pctInvestido: number,
  pctFinanciamento: number,
) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  const cols: { header: string; sub: string; value: string; isGreen?: boolean }[] = [];
  fluxo.ato.forEach((p) => cols.push({ header: p.label, sub: p.mes, value: fmt(p.valor) }));
  cols.push({ header: `${fluxo.numMensais} MENSAIS`, sub: "por parcela", value: fmt(fluxo.valorMensal) });
  fluxo.anuais.forEach((a, i) => cols.push({ header: `ANUAL ${i + 1}`, sub: a.mes, value: fmt(a.valor) }));
  cols.push({ header: "+DECORACAO", sub: "opcional", value: fmt(fluxo.decoracao) });
  cols.push({ header: "TOTAL INVESTIDO", sub: `${pctInvestido.toFixed(1)}%`, value: fmt(results.totalInvestido), isGreen: true });
  cols.push({ header: "FINANCIAMENTO", sub: `${pctFinanciamento.toFixed(1)}%`, value: fmt(results.financiamento) });
  cols.push({ header: "VALOR DO IMOVEL", sub: "base", value: fmt(fluxo.valorImovel) });

  const PADDING = 40;
  const COL_W = 148;
  const HEADER_H = 72;
  const ROW_H = 80;
  const TITLE_H = 80;
  const FOOTER_H = 44;
  const totalW = PADDING * 2 + cols.length * COL_W;
  const totalH = TITLE_H + HEADER_H + ROW_H + FOOTER_H + PADDING;

  const canvas = document.createElement("canvas");
  canvas.width = totalW * 2;
  canvas.height = totalH * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);

  // Background
  ctx.fillStyle = "#0a0f1a";
  ctx.fillRect(0, 0, totalW, totalH);

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Fluxo de Pagamento", totalW / 2, PADDING + 28);

  const tableX = PADDING;
  const tableY = TITLE_H;

  cols.forEach((col, i) => {
    const x = tableX + i * COL_W;
    const isGreen = col.isGreen;

    // Header bg
    ctx.fillStyle = isGreen ? "#16a34a" : "#1a9fc7";
    ctx.fillRect(x, tableY, COL_W, HEADER_H);

    // Header text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(col.header, x + COL_W / 2, tableY + 26);

    ctx.fillStyle = isGreen ? "#bbf7d0" : "#bae6fd";
    ctx.font = "10px system-ui, sans-serif";
    ctx.fillText("(" + col.sub + ")", x + COL_W / 2, tableY + 46);

    // Row bg
    ctx.fillStyle = isGreen ? "#dcfce7" : "#ffffff";
    ctx.fillRect(x, tableY + HEADER_H, COL_W, ROW_H);

    // Row value
    ctx.fillStyle = isGreen ? "#15803d" : "#1e293b";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(col.value, x + COL_W / 2, tableY + HEADER_H + ROW_H / 2 + 5);

    // Column divider
    if (i < cols.length - 1) {
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + COL_W, tableY);
      ctx.lineTo(x + COL_W, tableY + HEADER_H + ROW_H);
      ctx.stroke();
    }
  });

  // Table border
  ctx.strokeStyle = "#1e3a5f";
  ctx.lineWidth = 1;
  ctx.strokeRect(tableX, tableY, cols.length * COL_W, HEADER_H + ROW_H);

  // Footer
  ctx.fillStyle = "#64748b";
  ctx.font = "10px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "Calculadora Short Stay - Os valores sao estimativas e nao constituem assessoria financeira.",
    totalW / 2,
    tableY + HEADER_H + ROW_H + 28,
  );

  const link = document.createElement("a");
  link.download = "fluxo-pagamento.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export default function FluxoPage() {
  const {
    fluxo, results, updateAto, updateParcelaAtoMes, updateParcelaAtoValor,
    updateAnualMes, updateAnualValor, addAnual, removeAnual, setFluxo, syncValorImovel,
  } = useFluxo();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colors = useColors(isDark);
  const [exporting, setExporting] = useState(false);

  const pctInvestido = fluxo.valorImovel > 0 ? (results.totalInvestido / fluxo.valorImovel) * 100 : 0;
  const pctFinanciamento = 100 - pctInvestido;

  const handleExport = useCallback(() => {
    setExporting(true);
    try { exportFluxoPNG(fluxo, results, pctInvestido, pctFinanciamento); }
    finally { setTimeout(() => setExporting(false), 500); }
  }, [fluxo, results, pctInvestido, pctFinanciamento]);

  return (
    <div className="w-full pb-16" style={{ fontFamily: "'Geist', sans-serif" }}>
      {/* HERO */}
      <section className="px-4 md:px-6 pt-10 md:pt-16 pb-6 md:pb-10 text-center max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: colors.greenBg, border: `1px solid ${colors.greenBorder}`, color: colors.green }}>
            <Zap size={11} /> Distribuição do capital
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none mb-4" style={{ color: colors.text1 }}>
            Fluxo de{" "}
            <span style={{ color: colors.green }}>Pagamento</span>
          </h1>
          <p className="text-sm md:text-base leading-relaxed max-w-xl mx-auto" style={{ color: colors.text2 }}>
            Configure como o investimento será distribuído ao longo do tempo. O Total Investido alimenta automaticamente a base do ROI na calculadora.
          </p>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-4">
        {/* CONFIGURAÇÕES */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="rounded-2xl p-4 md:p-5"
          style={{ background: colors.surface, border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: colors.blueBg, color: colors.blue }}>
              <BarChart3 size={13} />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: colors.blue }}>Configurações</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* % do Ato */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: colors.text3 }}>% do Ato</label>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: colors.amberBg, color: colors.amber, fontFamily: "'Geist Mono', monospace" }}>
                  {fluxo.percentualAto.toFixed(2)}%
                </span>
              </div>
              <Slider min={9.8} max={30} step={0.1} value={[fluxo.percentualAto]}
                onValueChange={([v]) => updateAto(v, fluxo.parcelasAto)} />
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: colors.text4 }}>9,8%</span>
                <span className="text-xs" style={{ color: colors.text4 }}>30%</span>
              </div>
            </div>
            {/* Parcelas do Ato */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: colors.text3 }}>Parcelas do Ato</label>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: colors.blueBg, color: colors.blue, fontFamily: "'Geist Mono', monospace" }}>
                  {fluxo.parcelasAto}x
                </span>
              </div>
              <Slider min={1} max={4} step={1} value={[fluxo.parcelasAto]}
                onValueChange={([v]) => updateAto(fluxo.percentualAto, v)} />
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: colors.text4 }}>1x</span>
                <span className="text-xs" style={{ color: colors.text4 }}>4x</span>
              </div>
            </div>
            {/* Nº de Mensais */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: colors.text3 }}>Nº de Mensais</label>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: colors.blueBg, color: colors.blue, fontFamily: "'Geist Mono', monospace" }}>
                  {fluxo.numMensais} meses
                </span>
              </div>
              <Slider min={25} max={37} step={1} value={[fluxo.numMensais]}
                onValueChange={([v]) => setFluxo((p) => ({ ...p, numMensais: v }))} />
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: colors.text4 }}>25</span>
                <span className="text-xs" style={{ color: colors.text4 }}>37</span>
              </div>
            </div>
            {/* Parcelas Anuais */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: colors.text3 }}>Parcelas Anuais</label>
                <div className="flex items-center gap-1">
                  <button onClick={removeAnual} disabled={fluxo.anuais.length <= 1}
                    className="w-5 h-5 rounded-md flex items-center justify-center disabled:opacity-30"
                    style={{ background: colors.amberBg, color: colors.amber }}>
                    <MinusIcon size={11} />
                  </button>
                  <span className="text-xs font-bold px-2" style={{ color: colors.blue, fontFamily: "'Geist Mono', monospace" }}>
                    {fluxo.anuais.length}x
                  </span>
                  <button onClick={addAnual} disabled={fluxo.anuais.length >= 3}
                    className="w-5 h-5 rounded-md flex items-center justify-center disabled:opacity-30"
                    style={{ background: colors.greenBg, color: colors.green }}>
                    <Plus size={11} />
                  </button>
                </div>
              </div>
              <div className="text-xs py-2 px-3 rounded-xl" style={{ background: colors.inputBg, color: colors.text3 }}>
                {fluxo.anuais.length} parcela{fluxo.anuais.length > 1 ? "s" : ""} anual{fluxo.anuais.length > 1 ? "is" : ""} — edite na tabela
              </div>
            </div>
          </div>
        </motion.div>

        {/* TABELA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}>
          <div className="flex items-center justify-between px-4 py-3"
            style={{ background: colors.surface, borderBottom: `1px solid ${colors.divider}` }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: colors.blueBg, color: colors.blue }}>
                <BarChart3 size={13} />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: colors.blue }}>Fluxo de Pagamento</span>
            </div>
            <button onClick={handleExport} disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: colors.blueBg, border: `1px solid ${colors.blueBorder}`, color: colors.blue }}>
              <Download size={12} />
              {exporting ? "Gerando..." : "Exportar PNG"}
            </button>
          </div>
          <div className="overflow-x-auto" style={{ background: colors.surface }}>
            <table className="w-full" style={{ borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr>
                  {fluxo.ato.map((p) => (
                    <THead key={p.label} colors={colors}>
                      <div className="font-black">{p.label}</div>
                      <EditableMes value={p.mes} onChange={(v) => updateParcelaAtoMes(fluxo.ato.indexOf(p), v)} colors={colors} />
                    </THead>
                  ))}
                  <THead colors={colors}>
                    <div className="font-black">{fluxo.numMensais} MENSAIS</div>
                    <div className="text-xs font-normal opacity-70">por parcela</div>
                  </THead>
                  {fluxo.anuais.map((a, i) => (
                    <THead key={i} colors={colors}>
                      <div className="font-black">{fluxo.anuais.length}X ANUAIS {i + 1}</div>
                      <EditableMes value={a.mes} onChange={(v) => updateAnualMes(i, v)} colors={colors} />
                    </THead>
                  ))}
                  <THead colors={colors}>
                    <div className="font-black">+DECORAÇÃO</div>
                    <div className="text-xs font-normal opacity-70">(opcional)</div>

                  </THead>
                  <THead green colors={colors}>
                    <div className="font-black">TOTAL</div>
                    <div className="font-black">INVESTIDO</div>
                  </THead>
                  <THead colors={colors}>
                    <div className="font-black">FINANCIAMENTO</div>
                  </THead>
                  <THead colors={colors}>
                    <div className="font-black">VALOR</div>
                    <div className="font-black">DO IMÓVEL</div>
                  </THead>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {fluxo.ato.map((p, i) => (
                    <TCell key={p.label} colors={colors}>
                      <EditableValue value={p.valor} onChange={(v) => updateParcelaAtoValor(i, v)} colors={colors} />
                    </TCell>
                  ))}
                  <TCell colors={colors}>
                    <EditableValue value={fluxo.valorMensal} onChange={(v) => setFluxo((p) => ({ ...p, valorMensal: v }))} colors={colors} />
                    <div className="text-xs mt-0.5" style={{ color: colors.text3 }}>= {formatCurrency(results.totalMensais)} total</div>
                  </TCell>
                  {fluxo.anuais.map((a, i) => (
                    <TCell key={i} colors={colors}>
                      <EditableValue value={a.valor} onChange={(v) => updateAnualValor(i, v)} colors={colors} />
                    </TCell>
                  ))}
                  <TCell colors={colors}>
                    <EditableValue value={fluxo.decoracao} onChange={(v) => setFluxo((p) => ({ ...p, decoracao: v }))} colors={colors} />

                  </TCell>
                  <TCell green colors={colors}>
                    <div className="text-sm font-black" style={{ color: colors.green, fontFamily: "'Geist Mono', monospace" }}>
                      {formatCurrency(results.totalInvestido)}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: colors.green }}>{pctInvestido.toFixed(1)}% do imóvel</div>
                  </TCell>
                  <TCell colors={colors}>
                    <div className="text-sm font-bold" style={{ color: colors.blue, fontFamily: "'Geist Mono', monospace" }}>
                      {formatCurrency(results.financiamento)}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: colors.text3 }}>{pctFinanciamento.toFixed(1)}% do imóvel</div>
                  </TCell>
                  <TCell colors={colors}>
                    <EditableValue value={fluxo.valorImovel} onChange={(v) => syncValorImovel(v)} colors={colors} />
                  </TCell>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* DISTRIBUIÇÃO VISUAL */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl p-4 md:p-5"
          style={{ background: colors.surface, border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: colors.greenBg, color: colors.green }}>
              <BarChart3 size={13} />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: colors.green }}>Distribuição do Capital</span>
          </div>
          <div className="h-8 rounded-xl overflow-hidden flex mb-3" style={{ border: `1px solid ${colors.divider}` }}>
            <motion.div animate={{ width: `${pctInvestido}%` }} transition={{ duration: 0.6 }}
              className="h-full flex items-center justify-center text-xs font-bold text-white"
              style={{
                background: isDark ? "oklch(0.55 0.18 145 / 0.8)" : "oklch(0.48 0.18 145 / 0.85)",
                minWidth: pctInvestido > 10 ? "auto" : 0,
              }}>
              {pctInvestido > 8 && `${pctInvestido.toFixed(1)}%`}
            </motion.div>
            <motion.div animate={{ width: `${pctFinanciamento}%` }} transition={{ duration: 0.6 }}
              className="h-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: isDark ? "oklch(0.78 0.12 210 / 0.6)" : "oklch(0.52 0.22 250 / 0.7)" }}>
              {pctFinanciamento > 8 && `${pctFinanciamento.toFixed(1)}%`}
            </motion.div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Investido", value: results.totalInvestido, color: colors.green, sub: `${pctInvestido.toFixed(1)}% do imóvel` },
              { label: "Financiamento", value: results.financiamento, color: colors.blue, sub: `${pctFinanciamento.toFixed(1)}% do imóvel` },
              { label: "Valor do Imóvel", value: fluxo.valorImovel, color: colors.text1, sub: "base de cálculo" },
              { label: "Ato Total", value: results.totalAto, color: colors.amber, sub: `${fluxo.percentualAto.toFixed(2)}% — ${fluxo.parcelasAto}x` },
            ].map(({ label, value, color, sub }) => (
              <div key={label} className="rounded-xl p-3" style={{ background: colors.inputBg }}>
                <div className="text-xs mb-1" style={{ color: colors.text3 }}>{label}</div>
                <div className="text-base font-black" style={{ color, fontFamily: "'Geist Mono', monospace" }}>{formatCurrency(value)}</div>
                <div className="text-xs mt-0.5" style={{ color: colors.text4 }}>{sub}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs" style={{ color: colors.text4 }}>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm"
                style={{ background: isDark ? "oklch(0.55 0.18 145 / 0.8)" : "oklch(0.48 0.18 145 / 0.85)" }} />
              Investimento próprio (base do ROI)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm"
                style={{ background: isDark ? "oklch(0.78 0.12 210 / 0.6)" : "oklch(0.52 0.22 250 / 0.7)" }} />
              Financiamento bancário
            </div>
          </div>
        </motion.div>

        {/* NOTA ROI */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="rounded-xl px-4 py-3 text-xs"
          style={{ background: colors.greenBg, border: `1px solid ${colors.greenBorder}`, color: colors.green }}>
          <strong>ROI calculado sobre o Total Investido ({formatCurrency(results.totalInvestido)}).</strong>{" "}
          O financiamento ({formatCurrency(results.financiamento)}) é atualizado automaticamente na calculadora principal como "Saldo a Financiar".
        </motion.div>
      </div>
    </div>
  );
}
