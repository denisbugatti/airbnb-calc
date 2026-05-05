/**
 * Fluxo.tsx — Fluxo de Pagamento do Investimento
 * Dual theme: Dark Cosmos / Slate Premium
 * Exportação PNG via Canvas API nativa (sem html2canvas)
 * Suporta: parcelas do Ato, Mensais, Semestrais, Anuais, Decoração
 * Export PNG: tema claro ou escuro selecionável
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useFluxo } from "@/contexts/FluxoContext";
import { useTheme } from "@/contexts/ThemeContext";
import { formatCurrency } from "@/lib/calculator";
import {
  Download, Plus, Minus as MinusIcon, BarChart3, Zap, Building2,
  GripVertical, ImagePlus, X as XIcon, Sun, Moon,
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
import { ONE_INNOVATION_LOGO } from "@/lib/defaultLogo";

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
    // Semestrais usam mesma cor das anuais (azul)
    violet: isDark ? "oklch(0.78 0.12 210)" : "oklch(0.52 0.22 250)",
    violetBg: isDark ? "oklch(0.78 0.12 210 / 0.08)" : "oklch(0.52 0.22 250 / 0.07)",
    violetBorder: isDark ? "oklch(0.78 0.12 210 / 0.2)" : "oklch(0.52 0.22 250 / 0.25)",
    violetHead: isDark ? "oklch(0.78 0.12 210 / 0.18)" : "oklch(0.52 0.22 250 / 0.12)",
    violetCell: isDark ? "oklch(0.78 0.12 210 / 0.04)" : "oklch(0.52 0.22 250 / 0.03)",
    mono: isDark ? "oklch(0.95 0 0)" : "oklch(0.18 0.01 260)",
    cardShadow: isDark ? "none" : "0 1px 3px oklch(0 0 0 / 0.06), 0 4px 16px oklch(0 0 0 / 0.05)",
  };
}

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
            fontFamily: "'Geist Mono', monospace",
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
  logoDataUrl?: string,
  exportTheme: ExportTheme = "dark",
): Promise<string> {
  return new Promise((resolve) => {
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
    const cols: { header: string; sub: string; value: string; isGreen?: boolean; isViolet?: boolean }[] = [];
    fluxo.ato.forEach((p) => cols.push({ header: p.label, sub: p.mes, value: fmt(p.valor) }));
    cols.push({ header: `${fluxo.numMensais} MENSAIS`, sub: "por parcela", value: fmt(fluxo.valorMensal) });
    (fluxo.semestrais ?? []).forEach((s, i) => cols.push({ header: `SEMESTRAL ${i + 1}`, sub: s.mes, value: fmt(s.valor), isViolet: true }));
    fluxo.anuais.forEach((a, i) => cols.push({ header: `ANUAL ${i + 1}`, sub: a.mes, value: fmt(a.valor) }));
    if (incluirDecoracao) cols.push({ header: "+DECORACAO", sub: "opcional", value: fmt(fluxo.decoracao) });
    cols.push({ header: "TOTAL INVESTIDO", sub: `${pctInvestido.toFixed(1)}%`, value: fmt(results.totalInvestido), isGreen: true });
    cols.push({ header: "FINANCIAMENTO", sub: `${pctFinanciamento.toFixed(1)}%`, value: fmt(results.financiamento) });
    cols.push({ header: "VALOR DO IMOVEL", sub: "", value: fmt(fluxo.valorImovel) });

    // Paleta de cores por tema
    const isDarkTheme = exportTheme === "dark";
    const palette = {
      bg: isDarkTheme ? "#0a0f1a" : "#f8fafc",
      titleColor: isDarkTheme ? "#ffffff" : "#0f172a",
      subtitleColor: isDarkTheme ? "#38bdf8" : "#0284c7",
      headerBlue: isDarkTheme ? "#1a4a7a" : "#3b82f6",
      headerGreen: isDarkTheme ? "#16a34a" : "#16a34a",
      headerViolet: isDarkTheme ? "#1a4a7a" : "#3b82f6",
      headerTextColor: "#ffffff",
      headerSubBlue: isDarkTheme ? "#bae6fd" : "#dbeafe",
      headerSubGreen: isDarkTheme ? "#bbf7d0" : "#dcfce7",
      headerSubViolet: isDarkTheme ? "#bae6fd" : "#dbeafe",
      cellBlueBg: isDarkTheme ? "#0f1e30" : "#eff6ff",
      cellGreenBg: isDarkTheme ? "#dcfce7" : "#f0fdf4",
      cellVioletBg: isDarkTheme ? "#0f1e30" : "#eff6ff",
      cellBlueText: isDarkTheme ? "#e0f2fe" : "#1e3a5f",
      cellGreenText: isDarkTheme ? "#15803d" : "#15803d",
      cellVioletText: isDarkTheme ? "#e0f2fe" : "#1e3a5f",
      divider: isDarkTheme ? "#1e3a5f" : "#cbd5e1",
      colDivider: isDarkTheme ? "#e2e8f0" : "#94a3b8",
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

    const effectiveLogo = logoDataUrl || ONE_INNOVATION_LOGO;
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
    fluxo, results, updateAto, updateParcelaAtoMes, updateParcelaAtoValor,
    updateAnualMes, updateAnualValor, addAnual, removeAnual, removeAnualAt, reorderAnuais,
    updateSemestralMes, updateSemestralValor, addSemestral, removeSemestral, removeSemestralAt, reorderSemestrais,
    setFluxo, syncValorImovelParaCalc, syncToCalc,
    nomeEmpreendimento, setNomeEmpreendimento,
  } = useFluxo();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colors = useColors(isDark);
  const [exporting, setExporting] = useState(false);
  const [showComMobilia, setShowComMobilia] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exportTheme, setExportTheme] = useState<"dark" | "light">("dark");
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setLogoDataUrl(ev.target.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const pctInvestido = fluxo.valorImovel > 0 ? (results.totalInvestido / fluxo.valorImovel) * 100 : 0;
  const pctFinanciamento = 100 - pctInvestido;

  const handleExport = useCallback(async (incluirDecoracao = true) => {
    setExporting(true);
    try {
      const dataUrl = await gerarFluxoPNG(
        fluxo, results, pctInvestido, pctFinanciamento,
        nomeEmpreendimento, incluirDecoracao, logoDataUrl ?? undefined, exportTheme,
      );
      setPreviewUrl(dataUrl);
    } finally {
      setExporting(false);
    }
  }, [fluxo, results, pctInvestido, pctFinanciamento, nomeEmpreendimento, logoDataUrl, exportTheme]);

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
          <p className="text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-6" style={{ color: colors.text2 }}>
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
                  fontFamily: "'Geist', sans-serif",
                  fontWeight: 600,
                }}
              />
            </div>
            {/* Logo upload */}
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            {logoDataUrl ? (
              <div className="flex items-center gap-2 rounded-2xl px-3 py-2 transition-all"
                style={{ background: colors.inputBg, border: `1.5px solid ${colors.greenBorder}` }}>
                <img src={logoDataUrl} alt="Logo" className="h-7 w-auto object-contain rounded" />
                <button
                  onClick={() => setLogoDataUrl(null)}
                  className="w-5 h-5 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                  style={{ background: colors.amberBg, color: colors.amber }}
                  title="Remover logo">
                  <XIcon size={10} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: colors.inputBg, border: `1.5px dashed ${colors.border}`, color: colors.text3 }}
                title="Adicionar logo da incorporadora ao PNG exportado">
                <ImagePlus size={14} style={{ color: colors.blue }} />
                Logo no PNG
              </button>
            )}
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
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
            {/* Parcelas Semestrais */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: colors.text3 }}>Semestrais</label>
                <div className="flex items-center gap-1">
                  <button onClick={removeSemestral} disabled={semestrais.length === 0}
                    className="w-5 h-5 rounded-md flex items-center justify-center disabled:opacity-30"
                    style={{ background: colors.amberBg, color: colors.amber }}>
                    <MinusIcon size={11} />
                  </button>
                  <span className="text-xs font-bold px-2" style={{ color: colors.violet, fontFamily: "'Geist Mono', monospace" }}>
                    {semestrais.length}x
                  </span>
                  <button onClick={addSemestral}
                    className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{ background: colors.violetBg, color: colors.violet }}>
                    <Plus size={11} />
                  </button>
                </div>
              </div>
              <div className="text-xs py-2 px-3 rounded-xl" style={{ background: colors.inputBg, color: colors.text3 }}>
                {semestrais.length === 0
                  ? "Sem parcelas semestrais"
                  : `${semestrais.length} semestral${semestrais.length > 1 ? "is" : ""} — edite na tabela`}
              </div>
            </div>
            {/* Parcelas Anuais */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: colors.text3 }}>Anuais</label>
                <div className="flex items-center gap-1">
                  <button onClick={removeAnual} disabled={fluxo.anuais.length === 0}
                    className="w-5 h-5 rounded-md flex items-center justify-center disabled:opacity-30"
                    style={{ background: colors.amberBg, color: colors.amber }}>
                    <MinusIcon size={11} />
                  </button>
                  <span className="text-xs font-bold px-2" style={{ color: colors.blue, fontFamily: "'Geist Mono', monospace" }}>
                    {fluxo.anuais.length}x
                  </span>
                  <button onClick={addAnual}
                    className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{ background: colors.greenBg, color: colors.green }}>
                    <Plus size={11} />
                  </button>
                </div>
              </div>
              <div className="text-xs py-2 px-3 rounded-xl" style={{ background: colors.inputBg, color: colors.text3 }}>
                {fluxo.anuais.length === 0
                  ? "Sem parcelas anuais"
                  : `${fluxo.anuais.length} anual${fluxo.anuais.length > 1 ? "is" : ""} — edite na tabela`}
              </div>
            </div>
          </div>
        </motion.div>

        {/* TABELA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
            style={{ background: colors.surface, borderBottom: `1px solid ${colors.divider}` }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: colors.blueBg, color: colors.blue }}>
                <BarChart3 size={13} />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: colors.blue }}>Fluxo de Pagamento</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Seletor de tema do PNG */}
              <div className="flex items-center rounded-xl overflow-hidden"
                style={{ border: `1px solid ${colors.border}` }}>
                <button
                  onClick={() => setExportTheme("dark")}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    background: exportTheme === "dark" ? colors.blueBg : "transparent",
                    color: exportTheme === "dark" ? colors.blue : colors.text3,
                  }}
                  title="PNG tema escuro">
                  <Moon size={11} />
                  Escuro
                </button>
                <button
                  onClick={() => setExportTheme("light")}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    background: exportTheme === "light" ? colors.amberBg : "transparent",
                    color: exportTheme === "light" ? colors.amber : colors.text3,
                  }}
                  title="PNG tema claro">
                  <Sun size={11} />
                  Claro
                </button>
              </div>
              <button onClick={() => handleExport(true)} disabled={exporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: colors.blueBg, border: `1px solid ${colors.blueBorder}`, color: colors.blue }}
                title="Exportar com coluna de Decoração">
                <Download size={12} />
                {exporting ? "Gerando..." : "Com decoração"}
              </button>
              <button onClick={() => handleExport(false)} disabled={exporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: colors.greenBg, border: `1px solid ${colors.greenBorder}`, color: colors.green }}
                title="Exportar sem coluna de Decoração">
                <Download size={12} />
                Sem decoração
              </button>
            </div>
          </div>

          {/* Tabela com DnD para semestrais e anuais em contextos separados */}
          <div className="overflow-x-auto" style={{ background: colors.surface }}>
            <table className="w-full" style={{ borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr>
                  {/* Colunas do Ato */}
                  {fluxo.ato.map((p) => (
                    <THead key={p.label} colors={colors}>
                      <div className="font-black">{p.label}</div>
                      <EditableMes value={p.mes} onChange={(v) => updateParcelaAtoMes(fluxo.ato.indexOf(p), v)} colors={colors} />
                    </THead>
                  ))}
                  {/* Mensais */}
                  <THead colors={colors}>
                    <div className="font-black">{fluxo.numMensais} MENSAIS</div>
                    <div className="text-xs font-normal opacity-70">por parcela</div>
                  </THead>
                  {/* Semestrais (DnD) */}
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSemestral}>
                    <SortableContext items={semestrais.map((_, i) => `semestral-${i}`)} strategy={horizontalListSortingStrategy}>
                      {semestrais.map((s, i) => (
                        <SortableTHead key={`semestral-${i}`} id={`semestral-${i}`} colors={colors}
                          accentColor={colors.violet} accentBg={colors.violetHead}>
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              <GripVertical size={10} className="opacity-40" />
                              <span className="font-black">SEMESTRAL {i + 1}</span>
                            </div>
                            <button
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => { e.stopPropagation(); removeSemestralAt(i); }}
                              className="w-4 h-4 rounded flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                              style={{ background: colors.amberBg, color: colors.amber }}
                              title={`Remover Semestral ${i + 1}`}
                            >
                              <MinusIcon size={9} />
                            </button>
                          </div>
                          <EditableMes value={s.mes} onChange={(v) => updateSemestralMes(i, v)} colors={colors} />
                        </SortableTHead>
                      ))}
                    </SortableContext>
                  </DndContext>
                  {/* Anuais (DnD) */}
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndAnual}>
                    <SortableContext items={fluxo.anuais.map((_, i) => `anual-${i}`)} strategy={horizontalListSortingStrategy}>
                      {fluxo.anuais.map((a, i) => (
                        <SortableTHead key={`anual-${i}`} id={`anual-${i}`} colors={colors}
                          accentColor={colors.blue} accentBg={colors.blueHead}>
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              <GripVertical size={10} className="opacity-40" />
                              <span className="font-black">ANUAL {i + 1}</span>
                            </div>
                            <button
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => { e.stopPropagation(); removeAnualAt(i); }}
                              className="w-4 h-4 rounded flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                              style={{ background: colors.amberBg, color: colors.amber }}
                              title={`Remover Anual ${i + 1}`}
                            >
                              <MinusIcon size={9} />
                            </button>
                          </div>
                          <EditableMes value={a.mes} onChange={(v) => updateAnualMes(i, v)} colors={colors} />
                        </SortableTHead>
                      ))}
                    </SortableContext>
                  </DndContext>
                  {/* Decoração */}
                  <THead colors={colors}>
                    <div className="font-black">+DECORAÇÃO</div>
                    <div className="text-xs font-normal opacity-70">(opcional)</div>
                  </THead>
                  {/* Totais */}
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
                  {/* Células do Ato */}
                  {fluxo.ato.map((p, i) => (
                    <TCell key={p.label} colors={colors}>
                      <EditableValue value={p.valor} onChange={(v) => updateParcelaAtoValor(i, v)} colors={colors} />
                    </TCell>
                  ))}
                  {/* Mensais */}
                  <TCell colors={colors}>
                    <EditableValue value={fluxo.valorMensal} onChange={(v) => setFluxo((p) => ({ ...p, valorMensal: v }))} colors={colors} />
                    <div className="text-xs mt-0.5" style={{ color: colors.text3 }}>= {formatCurrency(results.totalMensais)} total</div>
                  </TCell>
                  {/* Semestrais (DnD) */}
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSemestral}>
                    <SortableContext items={semestrais.map((_, i) => `semestral-${i}`)} strategy={horizontalListSortingStrategy}>
                      {semestrais.map((s, i) => (
                        <SortableTCell key={`semestral-${i}`} id={`semestral-${i}`} colors={colors} accentBg={colors.violetCell}>
                          <EditableValue value={s.valor} onChange={(v) => updateSemestralValor(i, v)} colors={colors} />
                        </SortableTCell>
                      ))}
                    </SortableContext>
                  </DndContext>
                  {/* Anuais (DnD) */}
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndAnual}>
                    <SortableContext items={fluxo.anuais.map((_, i) => `anual-${i}`)} strategy={horizontalListSortingStrategy}>
                      {fluxo.anuais.map((a, i) => (
                        <SortableTCell key={`anual-${i}`} id={`anual-${i}`} colors={colors} accentBg={colors.blueCell}>
                          <EditableValue value={a.valor} onChange={(v) => updateAnualValor(i, v)} colors={colors} />
                        </SortableTCell>
                      ))}
                    </SortableContext>
                  </DndContext>
                  {/* Decoração */}
                  <TCell colors={colors}>
                    <EditableValue value={fluxo.decoracao} onChange={(v) => syncToCalc({ decoracao: v })} colors={colors} />
                  </TCell>
                  {/* Total Investido — toggle com/sem mobília */}
                  <TCell green colors={colors}>
                    <button
                      onClick={() => setShowComMobilia((v) => !v)}
                      className="w-full text-left transition-opacity hover:opacity-80"
                      title={showComMobilia ? "Clique para ver sem mobília" : "Clique para ver com mobília"}
                    >
                      <div className="text-sm font-black" style={{ color: colors.green, fontFamily: "'Geist Mono', monospace" }}>
                        {formatCurrency(showComMobilia ? results.totalInvestido + fluxo.decoracao : results.totalInvestido)}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: colors.green }}>
                        {showComMobilia
                          ? `c/ mobília — ${((showComMobilia ? results.totalInvestido + fluxo.decoracao : results.totalInvestido) / fluxo.valorImovel * 100).toFixed(1)}%`
                          : `${pctInvestido.toFixed(1)}% do imóvel`}
                      </div>
                      <div className="text-xs mt-1 px-1.5 py-0.5 rounded-md inline-block"
                        style={{ background: showComMobilia ? colors.amberBg : colors.greenBg, color: showComMobilia ? colors.amber : colors.green, fontSize: "0.6rem" }}>
                        {showComMobilia ? "COM MOBÍLIA" : "SEM MOBÍLIA"}
                      </div>
                    </button>
                  </TCell>
                  {/* Financiamento */}
                  <TCell colors={colors}>
                    <div className="text-sm font-bold" style={{ color: colors.blue, fontFamily: "'Geist Mono', monospace" }}>
                      {formatCurrency(results.financiamento)}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: colors.text3 }}>{pctFinanciamento.toFixed(1)}% do imóvel</div>
                  </TCell>
                  {/* Valor do Imóvel */}
                  <TCell colors={colors}>
                    <EditableValue value={fluxo.valorImovel} onChange={(v) => syncToCalc({ valorImovel: v })} colors={colors} />
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
              background: isDark ? "oklch(0.14 0.01 240)" : "oklch(0.98 0.005 240)",
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
