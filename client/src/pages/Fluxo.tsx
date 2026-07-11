/**
 * Fluxo.tsx — Fluxo de Pagamento do Investimento
 * Dual theme: Dark Cosmos / Slate Premium
 * Exportação PNG via Canvas API nativa (sem html2canvas)
 * Suporta: parcelas do Ato, Mensais, Semestrais, Anuais, Decoração
 * Export PNG: tema claro ou escuro selecionável
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { useFluxo, mesAtualFn, proximoMes, MESES } from "@/contexts/FluxoContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/contexts/ThemeContext";
import { formatCurrency } from "@/lib/calculator";
import {
  Download, Plus, Minus as MinusIcon, BarChart3, Zap, Building2,
  GripVertical, X as XIcon, Sun, Moon, RefreshCw, Trash2, Percent, BadgePercent, ArrowDownToLine,
  CalendarDays, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Paleta Vitacon compartilhada (mesma da Calculadora)
import { useVitaconColors as useColors } from "@/lib/vitaconColors";

// Helpers de milhar para o Fluxo
function fApplyMask(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const trimmed = digits.replace(/^0+(?=\d)/, "");
  return trimmed.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function fParse(str: string): number {
  const num = parseInt(str.replace(/\./g, ""), 10);
  return isNaN(num) ? 0 : num;
}
function fFormat(v: number): string {
  if (!v && v !== 0) return "";
  return Math.round(v).toLocaleString("pt-BR");
}
function EditableValue({ value, onChange, prefix = "R$", colors }: {
  value: number; onChange: (v: number) => void; prefix?: string;
  colors: ReturnType<typeof useColors>;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!editing && inputRef.current) {
      inputRef.current.value = fFormat(value);
    }
  }, [value, editing]);
  const handleFocus = () => {
    setEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.value = fFormat(value);
        inputRef.current.select();
      }
    }, 0);
  };
  const handleBlur = () => {
    setEditing(false);
    if (inputRef.current) {
      const parsed = fParse(inputRef.current.value);
      onChange(Math.max(0, parsed));
      inputRef.current.value = fFormat(Math.max(0, parsed));
    }
  };
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const raw = el.value;
    const cursor = el.selectionStart ?? raw.length;
    const dotsBefore = (raw.slice(0, cursor).match(/\./g) || []).length;
    const formatted = fApplyMask(raw);
    el.value = formatted;
    const newDots = (formatted.slice(0, cursor).match(/\./g) || []).length;
    const newCursor = Math.max(0, cursor + (newDots - dotsBefore));
    el.setSelectionRange(newCursor, newCursor);
    onChange(fParse(formatted));
  };
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-1">
        {prefix && !editing && (
          <span style={{ color: colors.text3, fontSize: "0.65em" }}>{prefix}</span>
        )}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          defaultValue={fFormat(value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInput={handleInput}
          onKeyDown={(e) => { if (e.key === "Enter") inputRef.current?.blur(); }}
          className="bg-transparent outline-none text-center text-sm font-bold min-w-0 w-full"
          style={{
            color: colors.mono,
            fontFamily: "var(--font-mono)",
            borderBottom: editing ? `1px solid ${colors.blue}` : "none",
          }}
          autoComplete="off"
          title="Clique para editar"
        />
      </div>
    </div>
  );
}

function EditableMes({ value, onChange, colors }: {
  value: string; onChange: (v: string) => void; colors: ReturnType<typeof useColors>;
}) {
  const [open, setOpen] = useState(false);
  const parts = value.split("/");
  const mesSel = MESES.indexOf(parts[0]);
  const anoSel = parseInt(parts[1]) || new Date().getFullYear();
  const [ano, setAno] = useState(anoSel);
  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setAno(anoSel); }}>
      <PopoverTrigger asChild>
        <button
          className="press w-full flex items-center justify-center gap-1.5 text-xs transition-opacity hover:opacity-80"
          style={{ color: colors.text3 }}
          title="Escolher mês no calendário"
        >
          <CalendarDays size={12} style={{ color: colors.blue }} />
          <span style={{ fontFamily: "var(--font-mono)" }}>{value || "—"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center" sideOffset={8} collisionPadding={16} avoidCollisions
        className="w-[228px] p-3 rounded-xl border-0"
        style={{ background: "#111111", border: "1px solid #2A2A2A", boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <button className="press w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#1A1A1A", color: "#B3B3B3" }} onClick={() => setAno(ano - 1)}>
            <ChevronLeft size={13} />
          </button>
          <span className="text-sm font-bold" style={{ color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{ano}</span>
          <button className="press w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#1A1A1A", color: "#B3B3B3" }} onClick={() => setAno(ano + 1)}>
            <ChevronRight size={13} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {MESES.map((m, i) => {
            const ativo = i === mesSel && ano === anoSel;
            return (
              <button
                key={m}
                className="press py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider"
                style={{
                  background: ativo ? "#2800FF" : "transparent",
                  color: ativo ? "#FFFFFF" : "#B3B3B3",
                  border: `1px solid ${ativo ? "#2800FF" : "#242424"}`,
                  fontFamily: "var(--font-mono)",
                }}
                onClick={() => { onChange(`${m}/${ano}`); setOpen(false); }}
              >
                {m}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}


// Linha do editor "Condição de pagamento" — módulo-level para não remontar inputs a cada render.
// Desktop: linha de tabela em 7 colunas. Mobile: card com labels e alvos de toque confortáveis.
function SerieRow({ serie, badge, parcelas, onParcelas, valorNode, venc, onVenc, total, onRecalc, onDelete, pct, onPct, onPctParcela, onDesconto, onAbsorver, colors }: {
  serie: string; badge?: string; parcelas: number; onParcelas?: (n: number) => void;
  valorNode: React.ReactNode; venc?: string; onVenc?: (m: string) => void;
  total: string; onRecalc?: () => void; onDelete?: () => void;
  pct?: number; onPct?: (p: number) => void;
  onPctParcela?: (p: number) => void; onDesconto?: (p: number) => void; onAbsorver?: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const pedirPct = (msg: string, cb: (p: number) => void) => {
    const raw = window.prompt(msg);
    if (raw == null) return;
    const p = parseFloat(raw.replace(",", "."));
    if (!isNaN(p) && p > 0) cb(p);
  };

  const parcelasNode = onParcelas ? (
    <input type="number" min={1} value={parcelas}
      onChange={(e) => onParcelas(Math.max(1, parseInt(e.target.value) || 1))}
      className="w-full md:w-14 bg-transparent text-center text-sm font-bold rounded-lg py-2 md:py-1 outline-none"
      style={{ color: "#FFFFFF", border: "1px solid #2A2A2A", fontFamily: "var(--font-mono)", minHeight: 40 }} />
  ) : (
    <span className="text-sm" style={{ color: "#B3B3B3", fontFamily: "var(--font-mono)" }}>{parcelas}</span>
  );

  const pctNode = onPct ? (
    <div className="flex items-center gap-1">
      <EditableValue value={Math.round(pct ?? 0)} onChange={onPct} prefix="" colors={colors} />
      <span className="text-xs" style={{ color: "#898A8E" }}>%</span>
    </div>
  ) : (
    <span className="text-sm" style={{ color: "#B3B3B3", fontFamily: "var(--font-mono)" }}>
      {pct !== undefined ? `${pct.toFixed(1).replace(".", ",")}%` : "—"}
    </span>
  );

  const vencNode = onVenc
    ? <EditableMes value={venc ?? ""} onChange={onVenc} colors={colors} />
    : <span className="text-xs" style={{ color: "#898A8E" }}>—</span>;

  const acoesNode = (
    <div className="flex items-center gap-1.5 justify-end">
      {onPctParcela && (
        <button className="press w-8 h-8 md:w-7 md:h-7 rounded-lg flex items-center justify-center" title="Definir valor da PARCELA por % do imóvel"
          style={{ background: "rgba(40,0,255,0.14)", color: "#2800FF" }}
          onClick={() => pedirPct("Valor de CADA parcela, em % do valor do imóvel:", onPctParcela)}>
          <Percent size={12} />
        </button>
      )}
      {onDesconto && (
        <button className="press w-8 h-8 md:w-7 md:h-7 rounded-lg flex items-center justify-center" title="Aplicar desconto (%) sobre o total da série"
          style={{ background: "rgba(63,214,143,0.12)", color: "#3FD68F" }}
          onClick={() => pedirPct("Desconto em % sobre o total desta série:", onDesconto)}>
          <BadgePercent size={12} />
        </button>
      )}
      {onAbsorver && (
        <button className="press w-8 h-8 md:w-7 md:h-7 rounded-lg flex items-center justify-center" title="Absorver o saldo restante (zera o financiamento) nesta série"
          style={{ background: "rgba(251,191,36,0.12)", color: "#FBBF24" }} onClick={onAbsorver}>
          <ArrowDownToLine size={12} />
        </button>
      )}
      {onRecalc && (
        <button className="press w-8 h-8 md:w-7 md:h-7 rounded-lg flex items-center justify-center" title="Recalcular parcelas"
          style={{ background: "rgba(40,0,255,0.14)", color: "#2800FF" }} onClick={onRecalc}>
          <RefreshCw size={12} />
        </button>
      )}
      {onDelete ? (
        <button className="press w-8 h-8 md:w-7 md:h-7 rounded-lg flex items-center justify-center" title="Excluir série"
          style={{ background: "rgba(255,107,87,0.12)", color: "#FF6B57" }} onClick={onDelete}>
          <Trash2 size={12} />
        </button>
      ) : <div className="w-7 h-7 hidden md:block" />}
    </div>
  );

  const Campo = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="rounded-xl px-3 py-2" style={{ background: "#111111", border: "1px solid #242424" }}>
      <div className="text-[9px] tracking-[0.2em] uppercase mb-1" style={{ color: "#898A8E", fontFamily: "var(--font-mono)" }}>{label}</div>
      <div className="flex items-center" style={{ minHeight: 28 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ background: "#0A0A0A", borderBottom: "1px solid #1E1E1E" }}>
      {/* Desktop: linha de tabela */}
      <div className="hidden md:grid md:grid-cols-[1.15fr_.55fr_.95fr_.6fr_.85fr_.95fr_auto] gap-2 items-center px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "#2800FF", fontFamily: "var(--font-mono)" }}>{serie}</span>
          {badge && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "#1A1A1A", color: "#898A8E", fontFamily: "var(--font-mono)" }}>{badge}</span>}
        </div>
        <div>{parcelasNode}</div>
        <div>{valorNode}</div>
        <div>{pctNode}</div>
        <div>{vencNode}</div>
        <div className="text-sm font-bold" style={{ color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{total}</div>
        {acoesNode}
      </div>

      {/* Mobile: card com labels */}
      <div className="md:hidden p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-bold tracking-wider uppercase truncate" style={{ color: "#2800FF", fontFamily: "var(--font-mono)" }}>{serie}</span>
            {badge && <span className="text-[9px] px-1.5 py-0.5 rounded shrink-0" style={{ background: "#1A1A1A", color: "#898A8E", fontFamily: "var(--font-mono)" }}>{badge}</span>}
          </div>
          {acoesNode}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Campo label="Parcelas">{parcelasNode}</Campo>
          <Campo label="1º Venc.">{vencNode}</Campo>
          <Campo label="Valor">{valorNode}</Campo>
          <Campo label="%">{pctNode}</Campo>
        </div>
        <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid #1E1E1E" }}>
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "#898A8E", fontFamily: "var(--font-mono)" }}>Total</span>
          <span className="text-base font-bold" style={{ color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{total}</span>
        </div>
      </div>
    </div>
  );
}

function THead({ children, green = false, violet = false, colors }: {
  children: React.ReactNode; green?: boolean; violet?: boolean; colors: ReturnType<typeof useColors>;
}) {
  const bg = green ? colors.greenHead : violet ? colors.violetHead : colors.blueHead;
  const color = green ? colors.green : violet ? colors.violet : colors.blue;
  return (
    <th className="px-2 py-2.5 text-center text-xs font-black tracking-wider uppercase"
      style={{
        background: bg,
        borderRight: `1px solid ${colors.divider}`,
        borderBottom: `1px solid ${colors.divider}`,
        color,
      }}>
      {children}
    </th>
  );
}

function TCell({ children, green = false, violet = false, colors }: {
  children: React.ReactNode; green?: boolean; violet?: boolean; colors: ReturnType<typeof useColors>;
}) {
  const bg = green ? colors.greenCell : violet ? colors.violetCell : colors.blueCell;
  return (
    <td className="px-2 py-2.5 text-center align-middle"
      style={{
        background: bg,
        borderRight: `1px solid ${colors.divider}`,
        borderBottom: `1px solid ${colors.divider}`,
      }}>
      {children}
    </td>
  );
}

// Sortable THead genérico (para anuais e semestrais)
function SortableTHead({ id, children, colors, accentColor, accentBg }: {
  id: string; children: React.ReactNode; colors: ReturnType<typeof useColors>;
  accentColor: string; accentBg: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <th
      ref={setNodeRef}
      className="px-2 py-2.5 text-center text-xs font-black tracking-wider uppercase"
      style={{
        background: accentBg,
        borderRight: `1px solid ${colors.divider}`,
        borderBottom: `1px solid ${colors.divider}`,
        color: accentColor,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </th>
  );
}

function SortableTCell({ id, children, colors, accentBg }: {
  id: string; children: React.ReactNode; colors: ReturnType<typeof useColors>; accentBg: string;
}) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <td
      ref={setNodeRef}
      className="px-2 py-2.5 text-center align-middle"
      style={{
        background: accentBg,
        borderRight: `1px solid ${colors.divider}`,
        borderBottom: `1px solid ${colors.divider}`,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {children}
    </td>
  );
}

// ── PNG Export ────────────────────────────────────────────────────────────────

type ExportTheme = "dark" | "light";

function gerarFluxoPNG(
  fluxo: ReturnType<typeof useFluxo>["fluxo"],
  results: ReturnType<typeof useFluxo>["results"],
  pctInvestido: number,
  pctFinanciamento: number,
  nome?: string,
  incluirDecoracao = true,
  exportTheme: ExportTheme = "dark",
  decoracao = 0,
  valorImovel = 0,
): Promise<string> {
  return new Promise((resolve) => {
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
    const cols: { header: string; sub: string; value: string; isGreen?: boolean; isViolet?: boolean }[] = [];
    fluxo.ato.forEach((p) => cols.push({ header: p.label, sub: p.mes, value: fmt(p.valor) }));
    cols.push({ header: `${fluxo.numMensais} MENSAIS`, sub: "por parcela", value: fmt(fluxo.valorMensal) });
    (fluxo.semestrais ?? []).forEach((s, i) => cols.push({ header: `SEMESTRAL ${i + 1}`, sub: s.mes, value: fmt(s.valor), isViolet: true }));
    fluxo.anuais.forEach((a, i) => cols.push({ header: `ANUAL ${i + 1}`, sub: a.mes, value: fmt(a.valor) }));
    if (incluirDecoracao) cols.push({ header: "+DECORACAO", sub: "opcional", value: fmt(decoracao) });
    cols.push({ header: "TOTAL INVESTIDO", sub: `${pctInvestido.toFixed(1)}%`, value: fmt(results.totalInvestido), isGreen: true });
    cols.push({ header: "FINANCIAMENTO", sub: `${pctFinanciamento.toFixed(1)}%`, value: fmt(results.financiamento) });
    cols.push({ header: "VALOR DO IMOVEL", sub: "", value: fmt(valorImovel) });

    // Paleta de cores por tema — identidade Vitacon (azul elétrico #2800FF)
    const isDarkTheme = exportTheme === "dark";
    const palette = {
      bg: isDarkTheme ? "#0a0a0b" : "#f5f5f5",
      titleColor: isDarkTheme ? "#ffffff" : "#0a0a0b",
      subtitleColor: isDarkTheme ? "#a99cff" : "#2800ff",
      headerBlue: isDarkTheme ? "#3d2bb8" : "#2800ff",
      headerGreen: "#0e8a4a",
      headerViolet: isDarkTheme ? "#3d2bb8" : "#2800ff",
      headerTextColor: "#ffffff",
      headerSubBlue: isDarkTheme ? "#cfc8ff" : "#dcd6ff",
      headerSubGreen: isDarkTheme ? "#bbf7d0" : "#dcfce7",
      headerSubViolet: isDarkTheme ? "#cfc8ff" : "#dcd6ff",
      cellBlueBg: isDarkTheme ? "#16141f" : "#f4f2ff",
      cellGreenBg: isDarkTheme ? "#dcfce7" : "#f0fdf4",
      cellVioletBg: isDarkTheme ? "#16141f" : "#f4f2ff",
      cellBlueText: isDarkTheme ? "#e6e2ff" : "#1b1263",
      cellGreenText: "#15803d",
      cellVioletText: isDarkTheme ? "#e6e2ff" : "#1b1263",
      divider: isDarkTheme ? "#262626" : "#e5e5e5",
      colDivider: isDarkTheme ? "#3a3a3a" : "#c9c9c9",
    };

    const PADDING = 40;
    const COL_W = 148;
    const HEADER_H = 72;
    const ROW_H = 80;
    const LOGO_H = 90;
    const TITLE_H = 60;
    const totalW = PADDING * 2 + cols.length * COL_W;
    const totalH = PADDING + LOGO_H + TITLE_H + HEADER_H + ROW_H + PADDING;

    const canvas = document.createElement("canvas");
    canvas.width = totalW * 2;
    canvas.height = totalH * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, totalW, totalH);

    const drawTable = () => {
      const titleY = PADDING + LOGO_H + 26;
      ctx.fillStyle = palette.titleColor;
      ctx.font = "bold 22px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Fluxo de Pagamento", totalW / 2, titleY);
      if (nome && nome.trim()) {
        ctx.fillStyle = palette.subtitleColor;
        ctx.font = "bold 14px system-ui, sans-serif";
        ctx.fillText(nome.trim(), totalW / 2, titleY + 22);
      }
      const tableX = PADDING;
      const tableY = PADDING + LOGO_H + TITLE_H;
      cols.forEach((col, i) => {
        const x = tableX + i * COL_W;
        const isGreen = col.isGreen;
        const isViolet = col.isViolet;
        // Header background
        ctx.fillStyle = isGreen ? palette.headerGreen : isViolet ? palette.headerViolet : palette.headerBlue;
        ctx.fillRect(x, tableY, COL_W, HEADER_H);
        // Header text
        ctx.fillStyle = palette.headerTextColor;
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(col.header, x + COL_W / 2, tableY + 26);
        if (col.sub) {
          ctx.fillStyle = isGreen ? palette.headerSubGreen : isViolet ? palette.headerSubViolet : palette.headerSubBlue;
          ctx.font = "10px system-ui, sans-serif";
          ctx.fillText("(" + col.sub + ")", x + COL_W / 2, tableY + 46);
        }
        // Cell background
        ctx.fillStyle = isGreen ? palette.cellGreenBg : isViolet ? palette.cellVioletBg : palette.cellBlueBg;
        ctx.fillRect(x, tableY + HEADER_H, COL_W, ROW_H);
        // Cell text
        ctx.fillStyle = isGreen ? palette.cellGreenText : isViolet ? palette.cellVioletText : palette.cellBlueText;
        ctx.font = "bold 13px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(col.value, x + COL_W / 2, tableY + HEADER_H + ROW_H / 2 + 5);
        // Column divider
        if (i < cols.length - 1) {
          ctx.strokeStyle = palette.colDivider;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + COL_W, tableY);
          ctx.lineTo(x + COL_W, tableY + HEADER_H + ROW_H);
          ctx.stroke();
        }
      });
      // Table border
      ctx.strokeStyle = palette.divider;
      ctx.lineWidth = 1;
      ctx.strokeRect(tableX, tableY, cols.length * COL_W, HEADER_H + ROW_H);
      resolve(canvas.toDataURL("image/png"));
    };

    // Logo Vitacon fixo — branco no export escuro, preto no claro
    const effectiveLogo = isDarkTheme ? "/vitacon-logo.png" : "/vitacon-logo-black.png";
    const img = new Image();
    img.onload = () => {
      const maxH = LOGO_H - 10;
      const ratio = img.width / img.height;
      const h = Math.min(maxH, img.height);
      const w = h * ratio;
      const logoX = (totalW - w) / 2;
      const logoY = PADDING;
      ctx.drawImage(img, logoX, logoY, w, h);
      drawTable();
    };
    img.onerror = drawTable;
    img.src = effectiveLogo;
  });
}

// ── FluxoPage ─────────────────────────────────────────────────────────────────

export default function FluxoPage() {
  const {
    fluxo, results, calc, setCalcField, updateAto, updateParcelaAtoMes, updateParcelaAtoValor,
    updateAnualMes, updateAnualValor, addAnual, removeAnual, removeAnualAt, reorderAnuais,
    updateSemestralMes, updateSemestralValor, addSemestral, removeSemestral, removeSemestralAt, reorderSemestrais,
    setFluxo, syncValorImovelParaCalc, syncToCalc,
    nomeEmpreendimento, setNomeEmpreendimento,
    incluiDecoracao, setIncluiDecoracao,
  } = useFluxo();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colors = useColors(isDark);
  const [exporting, setExporting] = useState(false);
  // incluiDecoracao vem do FluxoContext (compartilhado com a Calculadora)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [serieMenuOpen, setSerieMenuOpen] = useState(false);
  const planoRef = useRef<HTMLDivElement>(null);
  const [exportandoPlano, setExportandoPlano] = useState(false);
  const abrirPlanoPNG = async () => {
    const el = planoRef.current;
    if (!el) return;
    // Abre a aba JÁ (síncrono, no gesto do clique) para o popup não ser bloqueado;
    // mostra "gerando" enquanto o PNG é montado e depois injeta a imagem final.
    const win = window.open("", "_blank");
    win?.document.write(
      `<!doctype html><meta charset="utf-8"><title>Gerando imagem…</title>` +
      `<body style="margin:0;background:#000;color:#898A8E;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;">` +
      `<div style="font-size:13px;letter-spacing:.25em;text-transform:uppercase;">Gerando imagem…</div></body>`
    );
    setExportandoPlano(true);
    // Alarga temporariamente a peça para caber TODOS os blocos numa imagem só
    const scroller = el.querySelector<HTMLElement>(".overflow-x-auto");
    const inner = scroller?.firstElementChild as HTMLElement | null;
    const larguraFileira = inner ? inner.scrollWidth : 0;
    const larguraAlvo = Math.max(el.clientWidth, larguraFileira + 40);
    const prevWidth = el.style.width;
    const prevOverflow = scroller ? scroller.style.overflow : "";
    el.style.width = `${larguraAlvo}px`;
    el.classList.add("exporting");
    if (scroller) scroller.style.overflow = "visible";
    try {
      const t0 = performance.now();
      const dataUrl = await Promise.race([
        toPng(el, { pixelRatio: 2, backgroundColor: "#000000" }),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout na geração do PNG")), 45000)),
      ]);
      console.info(`[plano-png] gerado em ${Math.round(performance.now() - t0)}ms`);
      const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
      const nomeArq = `plano-pagamento-${(nomeEmpreendimento || "vitacon").replace(/[^\w.-]+/g, "-")}.png`;
      const titulo = nomeEmpreendimento ? `Plano de Pagamento · ${esc(nomeEmpreendimento)}` : "Plano de Pagamento";
      const paginaHTML =
        `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">` +
        `<meta name="viewport" content="width=device-width, initial-scale=1"><title>${titulo}</title>` +
        `<style>*{margin:0;padding:0;box-sizing:border-box}` +
        `body{background:#000;color:#fff;font-family:system-ui,-apple-system,sans-serif;min-height:100vh}` +
        `.bar{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:16px;` +
        `padding:14px 20px;background:rgba(0,0,0,.85);backdrop-filter:blur(12px);border-bottom:1px solid #1f1f1f}` +
        `.t{font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:#898A8E}` +
        `.btn{display:inline-flex;align-items:center;gap:8px;background:#2800FF;color:#fff;text-decoration:none;` +
        `font-weight:600;font-size:14px;padding:10px 18px;border-radius:10px;box-shadow:0 2px 10px rgba(40,0,255,.4);white-space:nowrap}` +
        `.btn:active{transform:scale(.97)}.wrap{display:flex;justify-content:center;padding:24px 16px 56px}` +
        `img{max-width:100%;height:auto;border-radius:12px;box-shadow:0 24px 70px rgba(0,0,0,.7)}</style></head>` +
        `<body><div class="bar"><span class="t">${titulo}</span>` +
        `<a class="btn" href="${dataUrl}" download="${esc(nomeArq)}">&#8681;&nbsp;Baixar PNG</a></div>` +
        `<div class="wrap"><img src="${dataUrl}" alt="Plano de Pagamento"></div></body></html>`;
      if (win) {
        win.document.open();
        win.document.write(paginaHTML);
        win.document.close();
      } else {
        // Popup bloqueado: baixa direto como fallback
        const link = document.createElement("a");
        link.download = nomeArq;
        link.href = dataUrl;
        link.click();
      }
    } catch (e) {
      console.error("[plano-png] falhou:", e);
      win?.close();
    } finally {
      el.style.width = prevWidth;
      el.classList.remove("exporting");
      if (scroller) scroller.style.overflow = prevOverflow;
      setExportandoPlano(false);
    }
  };
  const [exportTheme, setExportTheme] = useState<"dark" | "light">("dark");

  const pctInvestido = calc.valorImovel > 0 ? (results.totalInvestido / calc.valorImovel) * 100 : 0;
  const pctFinanciamento = 100 - pctInvestido;

  const handleExport = useCallback(async (incluirDecoracao = true) => {
    setExporting(true);
    try {
      const dataUrl = await gerarFluxoPNG(
        fluxo, results, pctInvestido, pctFinanciamento,
        nomeEmpreendimento, incluirDecoracao, exportTheme,
        calc.mobilia, calc.valorImovel,
      );
      setPreviewUrl(dataUrl);
    } finally {
      setExporting(false);
    }
  }, [fluxo, results, pctInvestido, pctFinanciamento, nomeEmpreendimento, exportTheme]);

  // DnD sensors — require 8px movement to start drag (prevents accidental drags on click)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Combinamos anuais e semestrais em um único DnD context por tipo
  const handleDragEndAnual = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIdx = fluxo.anuais.findIndex((_, i) => `anual-${i}` === active.id);
    const toIdx = fluxo.anuais.findIndex((_, i) => `anual-${i}` === over.id);
    if (fromIdx !== -1 && toIdx !== -1) reorderAnuais(fromIdx, toIdx);
  }, [fluxo.anuais, reorderAnuais]);

  const handleDragEndSemestral = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const sem = fluxo.semestrais ?? [];
    const fromIdx = sem.findIndex((_, i) => `semestral-${i}` === active.id);
    const toIdx = sem.findIndex((_, i) => `semestral-${i}` === over.id);
    if (fromIdx !== -1 && toIdx !== -1) reorderSemestrais(fromIdx, toIdx);
  }, [fluxo.semestrais, reorderSemestrais]);

  const semestrais = fluxo.semestrais ?? [];

  return (
    <div className="w-full pb-16" style={{ fontFamily: "var(--font-sans)" }}>
      {/* HERO — capa do Style Guide: preto absoluto + display azul + grafismo V */}
      <section className="relative overflow-hidden mb-6" style={{ background: "#000000" }}>
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
            <Zap size={11} style={{ color: "#2800FF" }} /> Distribuição do capital
          </div>
          <h1 className="uppercase tracking-tight" style={{ fontFamily: "var(--font-display)", fontWeight: 700, lineHeight: 0.98 }}>
            <span className="wipe block text-4xl sm:text-5xl md:text-6xl" style={{ color: "#FFFFFF" }}>Fluxo de</span>
            <span className="wipe wipe-2 block text-4xl sm:text-5xl md:text-6xl" style={{ color: "#2800FF" }}>pagamento</span>
          </h1>
          <p className="rise rise-3 mt-5 text-sm md:text-base leading-relaxed max-w-xl mb-6" style={{ color: "#B3B3B3" }}>
            Configure como o investimento será distribuído ao longo do tempo. O Total Investido alimenta automaticamente a base do ROI na calculadora.
          </p>
          {/* Campo de nome do empreendimento + logo */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div
              className="flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-all"
              style={{
                background: colors.inputBg,
                border: `1.5px solid ${colors.blueBorder}`,
                boxShadow: `0 0 0 3px ${colors.blueBg}`,
                maxWidth: 400,
                width: "100%",
              }}
            >
              <Building2 size={14} style={{ color: colors.blue, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Nome do empreendimento (aparece no relatório)"
                value={nomeEmpreendimento}
                onChange={(e) => setNomeEmpreendimento(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{
                  color: colors.text1,
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                }}
              />
            </div>
            {/* Logo Vitacon fixo no PNG exportado */}
            <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
              style={{ background: colors.inputBg, border: `1.5px solid ${colors.border}` }}
              title="O PNG exportado leva o logo Vitacon">
              <img
                src={isDark ? "/vitacon-logo.png" : "/vitacon-logo-black.png"}
                alt="Vitacon"
                className="h-3.5 w-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-4">
        {/* PLANO DE PAGAMENTO — brochure ON Paulista (sempre preto, fiel ao material) */}
        <motion.div
          className="rounded-2xl p-6 md:p-8 overflow-hidden"
          style={{ background: "#000000", border: "1px solid #1F1F1F" }}>
          {/* Baixar a peça (fica fora da área exportada) */}
          <div className="flex justify-end mb-4">
            <button onClick={abrirPlanoPNG} disabled={exportandoPlano}
              className="press flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
              title="Abre o plano em uma nova aba, com opção de baixar"
              style={{ background: "#2800FF", color: "#fff", boxShadow: "0 2px 8px rgba(40,0,255,0.3)", opacity: exportandoPlano ? 0.7 : 1 }}>
              <Download size={14} />
              {exportandoPlano ? "Gerando..." : "Ver / Baixar PNG"}
            </button>
          </div>

          {/* Área exportável: logo + label + nome + statement + cartões */}
          <div ref={planoRef} style={{ background: "#000000", padding: "20px 16px 24px" }}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 22, width: "auto", display: "block" }} />
              <div className="flex items-center gap-3 mt-3">
                <div style={{ width: 34, height: 2, background: "#2800FF" }} />
                <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "#2800FF", fontFamily: "var(--font-mono)" }}>
                  Plano de Pagamento
                </span>
              </div>
            </div>
            {nomeEmpreendimento && (
              <span className="text-[10px] tracking-[0.3em] uppercase pt-1" style={{ color: "#898A8E", fontFamily: "var(--font-mono)" }}>
                {nomeEmpreendimento}
              </span>
            )}
          </div>
          {/* Statement */}
          <p className="mb-7 text-2xl md:text-4xl" style={{ color: "#FFFFFF", fontFamily: "var(--font-sans)", fontWeight: 400, lineHeight: 1.15 }}>
            {fluxo.financiamentoExcluido
              ? `Pagamento à vista, sem financiamento.`
              : `Entrada de ${pctInvestido.toFixed(0)}%, o resto financiado.`}
          </p>
          {/* Cartões dinâmicos — um por série ativa, refletindo a Condição de Pagamento */}
          {(() => {
            const vi = calc.valorImovel;
            const pctDe = (v: number) => (vi > 0 ? `${((v / vi) * 100).toFixed(0)}%` : "");
            const totalSeries = results.totalInvestido + calc.mobilia;
            // Séries com mais de uma parcela mostram o valor de CADA parcela (o "N×" indica a quantidade);
            // `total` guarda a soma da série (usado para % e para a lógica do bloco azul de série única).
            const series: { label: string; pct: string; value: number; total: number }[] = [
              ...(results.totalAto > 0 ? [{ label: `Ato ${fluxo.parcelasAto}×`, pct: pctDe(results.totalAto), value: fluxo.parcelasAto > 1 ? Math.round(results.totalAto / fluxo.parcelasAto) : results.totalAto, total: results.totalAto }] : []),
              ...(results.totalMensais > 0 ? [{ label: `Mensais ${fluxo.numMensais}×`, pct: pctDe(results.totalMensais), value: fluxo.numMensais > 1 ? fluxo.valorMensal : results.totalMensais, total: results.totalMensais }] : []),
              ...(results.totalSemestrais > 0 ? [{ label: `Semestrais ${semestrais.length}×`, pct: pctDe(results.totalSemestrais), value: semestrais.length > 1 ? (semestrais[0]?.valor ?? 0) : results.totalSemestrais, total: results.totalSemestrais }] : []),
              ...(results.totalAnuais > 0 ? [{ label: `Anuais ${fluxo.anuais.length}×`, pct: pctDe(results.totalAnuais), value: fluxo.anuais.length > 1 ? (fluxo.anuais[0]?.valor ?? 0) : results.totalAnuais, total: results.totalAnuais }] : []),
              ...(fluxo.extras ?? []).filter((e) => e.valor * e.parcelas > 0).map((e) => ({
                label: e.parcelas > 1 ? `${e.tipo} ${e.parcelas}×` : e.tipo,
                pct: pctDe(e.valor * e.parcelas), value: e.parcelas > 1 ? e.valor : e.valor * e.parcelas, total: e.valor * e.parcelas,
              })),
              ...(calc.mobilia > 0 ? [{ label: "Decoração", pct: pctDe(calc.mobilia), value: calc.mobilia, total: calc.mobilia }] : []),
            ];
            const resumo: { label: string; pct: string; value: number; total?: number; solid?: boolean }[] = [
              { label: "Total Investido", pct: vi > 0 ? `${((totalSeries / vi) * 100).toFixed(0)}%` : "", value: totalSeries, solid: true },
              ...(fluxo.financiamentoExcluido ? [] : [{ label: "Financiamento", pct: pctDe(results.financiamento), value: results.financiamento }]),
              { label: "Valor do Imóvel", pct: "", value: vi },
            ];
            const Cartao = ({ label, pct, value, solid }: { label: string; pct: string; value: number; solid?: boolean }) => (
              <div className="rise p-5 md:p-6" style={{ background: solid ? "#2800FF" : "#0A0A0A" }}>
                <div className="text-[11px] tracking-[0.25em] uppercase mb-3"
                  style={{ color: solid ? "rgba(255,255,255,0.75)" : "#898A8E", fontFamily: "var(--font-mono)" }}>
                  {label}
                </div>
                <div className="text-xl md:text-2xl mb-1" style={{ color: solid ? "rgba(255,255,255,0.85)" : "#B3B3B3", fontFamily: "var(--font-sans)", fontWeight: 300, minHeight: "1.2em" }}>
                  {pct}
                </div>
                <div className="text-2xl md:text-3xl" style={{ color: "#FFFFFF", fontFamily: "var(--font-sans)", fontWeight: 400, letterSpacing: "-0.01em" }}>
                  {formatCurrency(value)}
                </div>
              </div>
            );
            return (
              /* Todos os blocos numa única linha horizontal: séries → Total → Financiamento → Imóvel */
              <div className="overflow-x-auto">
                <div className="flex"
                  style={{ gap: 1, background: "#242424", border: "1px solid #242424", width: "max-content", minWidth: "100%" }}>
                  {/* Série única (ex.: só Ato + Financiamento): a própria série vira o bloco azul, sem duplicar o Total.
                      Nesse caso o bloco mostra o total da série (é o "Total Investido"), não o valor da parcela. */}
                  {(series.length === 1 && Math.abs(series[0].total - totalSeries) < 1
                    ? [{ ...series[0], value: series[0].total, solid: true }, ...resumo.slice(1)]
                    : [...series, ...resumo]
                  ).map((c) => (
                    <div key={c.label} style={{ minWidth: 190, flex: "1 0 auto" }}>
                      <Cartao {...c} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          </div>

          {/* CONDIÇÃO DE PAGAMENTO — séries editáveis (referência: sistema de vendas) */}
          <div className="mt-7">
            <div className="text-[11px] tracking-[0.25em] uppercase mb-3" style={{ color: "#898A8E", fontFamily: "var(--font-mono)" }}>
              Condição de pagamento
            </div>

            {/* Cabeçalho */}
            <div className="hidden md:grid grid-cols-[1.3fr_.6fr_1fr_.9fr_1fr_auto] gap-2 px-4 py-2"
              style={{ borderBottom: "1px solid #242424" }}>
              {["Série", "Parcelas", "Valor", "%", "1º Venc.", "Total", "Ações"].map((h) => (
                <div key={h} className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "#898A8E", fontFamily: "var(--font-mono)" }}>{h}</div>
              ))}
            </div>

            {/* Linha genérica */}
            {(() => {
              const num = (v: number, onChange: (n: number) => void) => <EditableValue value={v} onChange={onChange} colors={colors} />;
              return (
                <div style={{ border: "1px solid #242424", borderBottom: "none" }}>
                  {fluxo.percentualAto > 0 && (
                    <SerieRow colors={colors} serie="Ato"
                      parcelas={fluxo.parcelasAto}
                      onParcelas={(n) => updateAto(fluxo.percentualAto, Math.min(6, n))}
                      valorNode={num(fluxo.ato[0]?.valor ?? 0, (v) => {
                        if (calc.valorImovel > 0) updateAto(((v * fluxo.parcelasAto) / calc.valorImovel) * 100, fluxo.parcelasAto);
                        else updateParcelaAtoValor(0, v);
                      })}
                      venc={fluxo.ato[0]?.mes ?? mesAtualFn()} onVenc={(m) => updateParcelaAtoMes(0, m)}
                      total={formatCurrency(results.totalAto)}
                      pct={fluxo.percentualAto}
                      onPct={(p) => updateAto(Math.min(100, p), fluxo.parcelasAto)}
                      onRecalc={() => updateAto(fluxo.percentualAto, fluxo.parcelasAto)}
                      onPctParcela={calc.valorImovel > 0 ? (p) => updateAto(Math.min(100, p * fluxo.parcelasAto), fluxo.parcelasAto) : undefined}
                      onDesconto={(p) => updateAto(fluxo.percentualAto * (1 - p / 100), fluxo.parcelasAto)}
                      onAbsorver={calc.valorImovel > 0 && results.financiamento > 0 ? () => updateAto(((results.totalAto + results.financiamento) / calc.valorImovel) * 100, fluxo.parcelasAto) : undefined}
                      onDelete={() => updateAto(0, 1)} />
                  )}
                  {fluxo.numMensais > 0 && (
                    <SerieRow colors={colors} serie="Mensal" parcelas={fluxo.numMensais}
                      onParcelas={(n) => setFluxo((p) => ({ ...p, numMensais: Math.min(120, n) }))}
                      valorNode={num(fluxo.valorMensal, (v) => setFluxo((p) => ({ ...p, valorMensal: v })))}
                      venc={fluxo.mesInicioMensais ?? proximoMes(mesAtualFn(), 1)}
                      onVenc={(m) => setFluxo((p) => ({ ...p, mesInicioMensais: m }))}
                      total={formatCurrency(results.totalMensais)}
                      pct={calc.valorImovel > 0 ? (results.totalMensais / calc.valorImovel) * 100 : undefined}
                      onPct={calc.valorImovel > 0 ? (p) => setFluxo((prev) => ({ ...prev, valorMensal: Math.round(((Math.min(100, p) / 100) * calc.valorImovel) / Math.max(1, prev.numMensais)) })) : undefined}
                      onPctParcela={calc.valorImovel > 0 ? (p) => setFluxo((prev) => ({ ...prev, valorMensal: Math.round((p / 100) * calc.valorImovel) })) : undefined}
                      onDesconto={(p) => setFluxo((prev) => ({ ...prev, valorMensal: Math.round(prev.valorMensal * (1 - p / 100)) }))}
                      onAbsorver={results.financiamento > 0 ? () => setFluxo((prev) => ({ ...prev, valorMensal: Math.round(prev.valorMensal + results.financiamento / Math.max(1, prev.numMensais)) })) : undefined}
                      onDelete={() => setFluxo((p) => ({ ...p, numMensais: 0 }))} />
                  )}
                  {semestrais.length > 0 && (
                    <SerieRow colors={colors} serie="Semestral" parcelas={semestrais.length}
                      onParcelas={(n) => setFluxo((p) => {
                        const base = (p.semestrais ?? [])[0] ?? { mes: proximoMes(mesAtualFn(), 6), valor: 0 };
                        return { ...p, semestrais: Array.from({ length: Math.min(20, n) }, (_, i) => ({ mes: proximoMes(base.mes, 6 * i), valor: base.valor })) };
                      })}
                      valorNode={num(semestrais[0]?.valor ?? 0, (v) => setFluxo((p) => ({ ...p, semestrais: (p.semestrais ?? []).map((s) => ({ ...s, valor: v })) })))}
                      venc={semestrais[0]?.mes ?? ""} onVenc={(m) => setFluxo((p) => ({ ...p, semestrais: (p.semestrais ?? []).map((s, i) => ({ ...s, mes: proximoMes(m, 6 * i) })) }))}
                      total={formatCurrency(results.totalSemestrais)}
                      pct={calc.valorImovel > 0 ? (results.totalSemestrais / calc.valorImovel) * 100 : undefined}
                      onPct={calc.valorImovel > 0 ? (p) => setFluxo((prev) => { const n = Math.max(1, (prev.semestrais ?? []).length); const v = Math.round(((Math.min(100, p) / 100) * calc.valorImovel) / n); return { ...prev, semestrais: (prev.semestrais ?? []).map((s) => ({ ...s, valor: v })) }; }) : undefined}
                      onPctParcela={calc.valorImovel > 0 ? (pp) => setFluxo((prev) => ({ ...prev, semestrais: (prev.semestrais ?? []).map((s) => ({ ...s, valor: Math.round((pp / 100) * calc.valorImovel) })) })) : undefined}
                      onDesconto={(pp) => setFluxo((prev) => ({ ...prev, semestrais: (prev.semestrais ?? []).map((s) => ({ ...s, valor: Math.round(s.valor * (1 - pp / 100)) })) }))}
                      onAbsorver={results.financiamento > 0 ? () => setFluxo((prev) => { const n = Math.max(1, (prev.semestrais ?? []).length); return { ...prev, semestrais: (prev.semestrais ?? []).map((s) => ({ ...s, valor: Math.round(s.valor + results.financiamento / n) })) }; }) : undefined}
                      onDelete={() => setFluxo((p) => ({ ...p, semestrais: [] }))} />
                  )}
                  {fluxo.anuais.length > 0 && (
                    <SerieRow colors={colors} serie="Anual" parcelas={fluxo.anuais.length}
                      onParcelas={(n) => setFluxo((p) => {
                        const base = p.anuais[0] ?? { mes: proximoMes(mesAtualFn(), 12), valor: 0 };
                        return { ...p, anuais: Array.from({ length: Math.min(15, n) }, (_, i) => ({ mes: proximoMes(base.mes, 12 * i), valor: base.valor })) };
                      })}
                      valorNode={num(fluxo.anuais[0]?.valor ?? 0, (v) => setFluxo((p) => ({ ...p, anuais: p.anuais.map((a) => ({ ...a, valor: v })) })))}
                      venc={fluxo.anuais[0]?.mes ?? ""} onVenc={(m) => setFluxo((p) => ({ ...p, anuais: p.anuais.map((a, i) => ({ ...a, mes: proximoMes(m, 12 * i) })) }))}
                      total={formatCurrency(results.totalAnuais)}
                      pct={calc.valorImovel > 0 ? (results.totalAnuais / calc.valorImovel) * 100 : undefined}
                      onPct={calc.valorImovel > 0 ? (p) => setFluxo((prev) => { const n = Math.max(1, prev.anuais.length); const v = Math.round(((Math.min(100, p) / 100) * calc.valorImovel) / n); return { ...prev, anuais: prev.anuais.map((a) => ({ ...a, valor: v })) }; }) : undefined}
                      onPctParcela={calc.valorImovel > 0 ? (pp) => setFluxo((prev) => ({ ...prev, anuais: prev.anuais.map((a) => ({ ...a, valor: Math.round((pp / 100) * calc.valorImovel) })) })) : undefined}
                      onDesconto={(pp) => setFluxo((prev) => ({ ...prev, anuais: prev.anuais.map((a) => ({ ...a, valor: Math.round(a.valor * (1 - pp / 100)) })) }))}
                      onAbsorver={results.financiamento > 0 ? () => setFluxo((prev) => { const n = Math.max(1, prev.anuais.length); return { ...prev, anuais: prev.anuais.map((a) => ({ ...a, valor: Math.round(a.valor + results.financiamento / n) })) }; }) : undefined}
                      onDelete={() => setFluxo((p) => ({ ...p, anuais: [] }))} />
                  )}
                  {calc.mobilia > 0 && (
                    <SerieRow colors={colors} serie="Decor" badge="decoração" parcelas={1}
                      valorNode={num(calc.mobilia, (v) => setCalcField("mobilia", v))}
                      total={formatCurrency(calc.mobilia)}
                      pct={calc.valorImovel > 0 ? (calc.mobilia / calc.valorImovel) * 100 : undefined}
                      onPct={calc.valorImovel > 0 ? (p) => setCalcField("mobilia", Math.round((Math.min(100, p) / 100) * calc.valorImovel)) : undefined}
                      onDesconto={(pp) => setCalcField("mobilia", Math.round(calc.mobilia * (1 - pp / 100)))}
                      onAbsorver={results.financiamento > 0 ? () => setCalcField("mobilia", Math.round(calc.mobilia + results.financiamento)) : undefined}
                      onDelete={() => setCalcField("mobilia", 0)} />
                  )}
                  {(fluxo.extras ?? []).map((ex) => (
                    <SerieRow colors={colors} key={ex.id} serie={ex.tipo.toLowerCase()} parcelas={ex.parcelas}
                      onParcelas={(n) => setFluxo((p) => ({ ...p, extras: (p.extras ?? []).map((e) => e.id === ex.id ? { ...e, parcelas: n } : e) }))}
                      valorNode={num(ex.valor, (v) => setFluxo((p) => ({ ...p, extras: (p.extras ?? []).map((e) => e.id === ex.id ? { ...e, valor: v } : e) })))}
                      venc={ex.mes} onVenc={(m) => setFluxo((p) => ({ ...p, extras: (p.extras ?? []).map((e) => e.id === ex.id ? { ...e, mes: m } : e) }))}
                      total={formatCurrency(ex.valor * ex.parcelas)}
                      pct={calc.valorImovel > 0 ? ((ex.valor * ex.parcelas) / calc.valorImovel) * 100 : undefined}
                      onPct={calc.valorImovel > 0 ? (p) => setFluxo((prev) => ({ ...prev, extras: (prev.extras ?? []).map((e) => e.id === ex.id ? { ...e, valor: Math.round(((Math.min(100, p) / 100) * calc.valorImovel) / Math.max(1, e.parcelas)) } : e) })) : undefined}
                      onPctParcela={calc.valorImovel > 0 ? (pp) => setFluxo((prev) => ({ ...prev, extras: (prev.extras ?? []).map((e) => e.id === ex.id ? { ...e, valor: Math.round((pp / 100) * calc.valorImovel) } : e) })) : undefined}
                      onDesconto={(pp) => setFluxo((prev) => ({ ...prev, extras: (prev.extras ?? []).map((e) => e.id === ex.id ? { ...e, valor: Math.round(e.valor * (1 - pp / 100)) } : e) }))}
                      onAbsorver={results.financiamento > 0 ? () => setFluxo((prev) => ({ ...prev, extras: (prev.extras ?? []).map((e) => e.id === ex.id ? { ...e, valor: Math.round(e.valor + results.financiamento / Math.max(1, e.parcelas)) } : e) })) : undefined}
                      onDelete={() => setFluxo((p) => ({ ...p, extras: (p.extras ?? []).filter((e) => e.id !== ex.id) }))} />
                  ))}
                  {!fluxo.financiamentoExcluido && (
                    <SerieRow colors={colors} serie="Financiamento"
                      parcelas={calc.prazoMeses}
                      onParcelas={(n) => setCalcField("prazoMeses", Math.min(600, n))}
                      valorNode={<EditableValue value={results.financiamento} onChange={(v) => setFluxo((p) => ({ ...p, financiamentoManual: v }))} colors={colors} />}
                      pct={calc.valorImovel > 0 ? (results.financiamento / calc.valorImovel) * 100 : undefined}
                      onPct={calc.valorImovel > 0 ? (p) => setFluxo((prev) => ({ ...prev, financiamentoManual: Math.round((Math.min(100, p) / 100) * calc.valorImovel) })) : undefined}
                      onDesconto={(p) => setFluxo((prev) => ({ ...prev, financiamentoManual: Math.round(results.financiamento * (1 - p / 100)) }))}
                      onAbsorver={calc.valorImovel > 0 ? () => setFluxo((p) => ({ ...p, financiamentoManual: undefined })) : undefined}
                      onRecalc={fluxo.financiamentoManual !== undefined ? () => setFluxo((p) => ({ ...p, financiamentoManual: undefined })) : undefined}
                      onDelete={() => setFluxo((p) => ({ ...p, financiamentoExcluido: true, financiamentoManual: undefined }))}
                      total={formatCurrency(results.financiamento)} />
                  )}
                </div>
              );
            })()}

            {/* VALOR TOTAL DO IMÓVEL — faixa sólida, editável */}
            <div className="flex justify-between items-center gap-4 px-5 py-4 mt-0"
              style={{ background: "#2800FF" }}>
              <span className="text-sm md:text-base font-semibold" style={{ color: "#FFFFFF", fontFamily: "var(--font-sans)" }}>
                Valor total do imóvel
              </span>
              <div className="w-44 text-right">
                <EditableValue value={calc.valorImovel} onChange={(v) => syncValorImovelParaCalc(v)} colors={colors} />
              </div>
            </div>

            {/* LEGENDA das ações */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 px-1">
              {[
                { icon: <Percent size={11} />, cor: "#2800FF", txt: "define cada parcela por % do imóvel" },
                { icon: <BadgePercent size={11} />, cor: "#3FD68F", txt: "desconto na série" },
                { icon: <ArrowDownToLine size={11} />, cor: "#FBBF24", txt: "puxa o que falta p/ essa série" },
                { icon: <RefreshCw size={11} />, cor: "#2800FF", txt: "redivide o ato entre as parcelas" },
                { icon: <Trash2 size={11} />, cor: "#FF6B57", txt: "apaga a série" },
              ].map(({ icon, cor, txt }) => (
                <span key={txt} className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: "#898A8E", fontFamily: "var(--font-sans)" }}>
                  <span style={{ color: cor }}>{icon}</span>
                  {txt}
                </span>
              ))}
            </div>

            {/* + ADICIONAR SÉRIE */}
            <div className="relative mt-4 flex justify-end">
              <button className="press px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase"
                style={{ background: "#2800FF", color: "#FFFFFF" }}
                onClick={() => setSerieMenuOpen((v) => !v)}>
                + Adicionar série
              </button>
              {serieMenuOpen && (
                <div className="absolute right-0 bottom-12 z-30 rounded-xl overflow-hidden"
                  style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", boxShadow: "0 16px 48px rgba(0,0,0,0.6)", minWidth: 240 }}>
                  {["ADIMPLÊNCIA PREMIADA", "ANUAL", "ATO", "DAÇÃO IMÓVEL", "DECOR", "FINANCIAMENTO", "MENSAL", "PERIODICIDADE", "SINAL", "ÚNICA"].map((tipo) => (
                    <button key={tipo}
                      className="block w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/40"
                      style={{ color: "#FFFFFF", fontFamily: "var(--font-sans)" }}
                      onClick={() => {
                        setSerieMenuOpen(false);
                        if (tipo === "ANUAL") { addAnual(); return; }
                        if (tipo === "ATO" || tipo === "SINAL") {
                          updateAto(fluxo.percentualAto > 0 ? fluxo.percentualAto : 10,
                            fluxo.percentualAto > 0 ? Math.min(6, fluxo.parcelasAto + 1) : (tipo === "SINAL" ? 2 : 1));
                          return;
                        }
                        if (tipo === "FINANCIAMENTO") { setFluxo((p) => ({ ...p, financiamentoExcluido: false, financiamentoManual: undefined })); return; }
                        if (tipo === "MENSAL") { setFluxo((p) => ({ ...p, numMensais: p.numMensais > 0 ? p.numMensais : 37 })); return; }
                        if (tipo === "DECOR") { if (calc.mobilia === 0) setCalcField("mobilia", 30000); return; }
                        setFluxo((p) => ({
                          ...p,
                          extras: [...(p.extras ?? []), {
                            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                            tipo, parcelas: 1, valor: 0, mes: mesAtualFn(),
                          }],
                        }));
                      }}>
                      {tipo}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* NOTA ROI */}
        <motion.div
          className="rounded-xl px-4 py-3 text-xs"
          style={{ background: colors.greenBg, border: `1px solid ${colors.greenBorder}`, color: colors.green }}>
          <strong>ROI calculado sobre o Total Investido ({formatCurrency(results.totalInvestido)}).</strong>{" "}
          {fluxo.financiamentoExcluido
            ? `Pagamento à vista — sem financiamento; o saldo a financiar na calculadora é R$ 0.`
            : `O financiamento (${formatCurrency(results.financiamento)}) é atualizado automaticamente na calculadora principal como "Saldo a Financiar".`}
        </motion.div>
      </div>

      {/* MODAL DE PREVIEW DO PNG */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(4px)" }}
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative rounded-2xl overflow-hidden flex flex-col"
            style={{
              maxWidth: "95vw",
              maxHeight: "90vh",
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do modal */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: `1px solid ${colors.divider}` }}
            >
              <span className="text-sm font-bold" style={{ color: colors.text1 }}>
                Preview — Fluxo de Pagamento
                <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-lg"
                  style={{ background: exportTheme === "dark" ? colors.blueBg : colors.amberBg, color: exportTheme === "dark" ? colors.blue : colors.amber }}>
                  {exportTheme === "dark" ? "Tema escuro" : "Tema claro"}
                </span>
              </span>
              <button
                onClick={() => setPreviewUrl(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ background: colors.amberBg, color: colors.amber }}
                title="Fechar"
              >
                <XIcon size={13} />
              </button>
            </div>
            {/* Imagem com scroll */}
            <div className="overflow-auto flex-1 p-4">
              <img
                src={previewUrl}
                alt="Preview Fluxo de Pagamento"
                style={{ display: "block", maxWidth: "none", height: "auto", borderRadius: 8 }}
              />
            </div>
            {/* Footer do modal */}
            <div
              className="flex items-center justify-end gap-3 px-5 py-3"
              style={{ borderTop: `1px solid ${colors.divider}` }}
            >
              <button
                onClick={() => setPreviewUrl(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: colors.inputBg, color: colors.text2, border: `1px solid ${colors.border}` }}
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.download = `fluxo-pagamento${nomeEmpreendimento ? `-${nomeEmpreendimento.replace(/\s+/g, "-")}` : ""}.png`;
                  link.href = previewUrl;
                  link.click();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: colors.greenBg, border: `1px solid ${colors.greenBorder}`, color: colors.green }}
              >
                <Download size={14} />
                Salvar imagem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
