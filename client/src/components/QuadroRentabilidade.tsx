/**
 * QuadroRentabilidade.tsx
 * Quadro de rentabilidade estilizado (template Airbnb) com exportação PNG.
 * Suporta modo claro e escuro via prop isDark — segue o toggle de tema do site.
 */

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import type { CalculatorInputs, CalculatorResults } from "@/lib/calculator";

const AIRBNB_LOGO_URL = "/manus-storage/airbnb-logo_a915ef9c.webp";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}
function fmtPct(v: number) {
  return `${v.toFixed(2).replace(".", ",")}%`;
}

// ─── Tokens de cor por tema ───────────────────────────────────────────────────
function getTokens(isDark: boolean) {
  if (isDark) {
    return {
      // Fundos
      bgOuter:       "linear-gradient(135deg, #0f172a 0%, #0d1b2e 60%, #0a1628 100%)",
      bgCard:        "transparent",
      bgHeader:      "transparent",
      bgTotal:       "rgba(255,255,255,0.07)",
      bgReceita:     "rgba(34,197,94,0.07)",
      bgHighlight:   "rgba(34,197,94,0.07)",
      exportBg:      "#0f172a",
      // Bordas
      borderTotal:   "transparent",
      borderReceita: "transparent",
      borderHighlight: "3px solid #22c55e",
      divider:       "rgba(255,255,255,0.08)",
      // Textos
      titulo:        "#f1f5f9",
      subtitulo:     "#64748b",
      labelPrimary:  "#e2e8f0",
      labelSecondary:"#94a3b8",
      labelHighlight:"#22c55e",
      // Valores
      valorTotal:    "#22c55e",
      valorData:     "#e2e8f0",
      valorDespesa:  "#facc15",
      valorReceita:  "#22c55e",
      valorResult:   "#22c55e",
      // Logo
      logoFilter:    "none",
      // Botão exportar
      btnBg:         "linear-gradient(135deg, #22c55e, #16a34a)",
      btnShadow:     "0 2px 8px rgba(34,197,94,0.35)",
    };
  }
  return {
    // Fundos
    bgOuter:       "#F7F8FA",
    bgCard:        "#FFFFFF",
    bgHeader:      "linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)",
    bgTotal:       "#FFF0F2",
    bgReceita:     "#F0FDF4",
    bgHighlight:   "#F0FDF4",
    exportBg:      "#F7F8FA",
    // Bordas
    borderTotal:   "1px solid #FFD6DC",
    borderReceita: "1px solid #BBF7D0",
    borderHighlight: "3px solid #16A34A",
    divider:       "#E5E7EB",
    // Textos
    titulo:        "#111827",
    subtitulo:     "#9CA3AF",
    labelPrimary:  "#374151",
    labelSecondary:"#6B7280",
    labelHighlight:"#16A34A",
    // Valores
    valorTotal:    "#FF385C",
    valorData:     "#111827",
    valorDespesa:  "#B45309",  // âmbar escuro — legível no fundo claro
    valorReceita:  "#16A34A",
    valorResult:   "#16A34A",
    // Logo
    logoFilter:    "none",
    // Botão exportar
    btnBg:         "linear-gradient(135deg, #FF385C, #e0274a)",
    btnShadow:     "0 2px 8px rgba(255,56,92,0.35)",
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  inputs: CalculatorInputs;
  results: CalculatorResults;
  incluiDecoracao: boolean;
  nomeEmpreendimento?: string;
  isDark?: boolean;
}

export function QuadroRentabilidade({ inputs, results, incluiDecoracao, nomeEmpreendimento, isDark = true }: Props) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const T = getTokens(isDark);

  // ── Cálculos ────────────────────────────────────────────────────────────────
  const totalInvestido   = inputs.capitalProprio + (incluiDecoracao ? (inputs.mobilia || 0) : 0);
  const ocupacaoPct      = inputs.diasOcupacao > 0 ? Math.round((inputs.diasOcupacao / 30) * 100) : 0;
  const iptuWifiAguaLuz  = inputs.iptuMensal + inputs.wifi + inputs.agua + inputs.luz;
  const admSeguroPct     = Math.round(inputs.taxaAdminSeguro * 100);
  const prazoAnos        = Math.round(inputs.prazoMeses / 12);
  const taxaMensal       = (inputs.taxaJurosMensal * 100).toFixed(1).replace(".", ",");
  const retornoAM        = totalInvestido > 0 ? (results.rendaMensalLiquida / totalInvestido) * 100 : 0;
  const retornoAA        = retornoAM * 12;
  const patrimonioAM     = inputs.valorImovel > 0 ? (results.rendaMensalLiquida / inputs.valorImovel) * 100 : 0;
  const patrimonioAA     = patrimonioAM * 12;

  // Despesas ordenadas do maior para o menor
  const despesas = [
    { label: `Valor estimado do condomínio (R$${Math.round(inputs.condominio / (inputs.areaM2 || 1))}/M²)`, value: inputs.condominio },
    { label: "IPTU, WIFI, água e luz", value: iptuWifiAguaLuz },
    { label: `Administração + Seguro (${admSeguroPct}%)`, value: results.adminSeguro },
    ...(results.parcelaFinanciamento > 0
      ? [{ label: `Parcela do financiamento (${prazoAnos} anos com taxa ${taxaMensal}%)`, value: results.parcelaFinanciamento }]
      : []),
  ].sort((a, b) => b.value - a.value);

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: T.exportBg });
      const link = document.createElement("a");
      link.download = `rentabilidade-${nomeEmpreendimento || "airbnb"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Erro ao exportar:", e);
    } finally {
      setExporting(false);
    }
  };

  // ── Sub-components (usam T) ─────────────────────────────────────────────────
  const Divider = () => (
    <div style={{ height: 1, background: T.divider, margin: "6px 0" }} />
  );

  const DataRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px" }}>
      <span style={{ color: T.labelSecondary, fontSize: 13.5, fontFamily: "system-ui, sans-serif" }}>{label}</span>
      <span style={{ color: valueColor ?? T.valorData, fontSize: 13.5, fontWeight: 500, fontFamily: "system-ui, sans-serif" }}>{value}</span>
    </div>
  );

  const HeaderRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: T.bgTotal, border: T.borderTotal,
      borderRadius: 8, padding: "14px 20px", marginBottom: 2,
    }}>
      <span style={{ color: T.labelPrimary, fontSize: 15, fontWeight: 500, fontFamily: "system-ui, sans-serif" }}>{label}</span>
      <span style={{ color: T.valorTotal, fontSize: 18, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>{value}</span>
    </div>
  );

  const HighlightRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderLeft: T.borderHighlight,
      background: T.bgHighlight,
      borderRadius: "0 8px 8px 0",
      padding: "13px 20px", marginBottom: 2,
    }}>
      <span style={{ color: T.labelHighlight, fontSize: 14.5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>{label}</span>
      <span style={{ color: T.valorResult, fontSize: 16, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>{value}</span>
    </div>
  );

  const ReceitaRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderLeft: T.borderHighlight,
      background: T.bgReceita,
      border: T.borderReceita,
      borderRadius: "0 8px 8px 0",
      padding: "13px 20px", marginBottom: 2,
    }}>
      <span style={{ color: T.labelHighlight, fontSize: 14.5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>{label}</span>
      <span style={{ color: T.valorReceita, fontSize: 16, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>{value}</span>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Botão exportar */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ background: T.btnBg, color: "#fff", boxShadow: T.btnShadow, opacity: exporting ? 0.7 : 1 }}
        >
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {exporting ? "Exportando..." : "Exportar PNG"}
        </button>
      </div>

      {/* Card exportável */}
      <div
        ref={cardRef}
        style={{
          background: T.bgOuter,
          borderRadius: 16,
          padding: isDark ? "32px 28px" : "24px 20px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          minWidth: 340,
        }}
      >
        {/* Wrapper interno (só no light tem card branco com sombra) */}
        <div style={{
          background: T.bgCard,
          borderRadius: isDark ? 0 : 14,
          boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          overflow: "hidden",
          padding: isDark ? 0 : "0 0 8px",
        }}>

          {/* HEADER */}
          <div style={{
            background: T.bgHeader,
            borderBottom: isDark ? "none" : `1px solid #F3F4F6`,
            padding: isDark ? "0 0 28px" : "24px 24px 20px",
            textAlign: "center",
            marginBottom: isDark ? 0 : 0,
          }}>
            <img
              src={AIRBNB_LOGO_URL}
              alt="Airbnb"
              style={{
                height: 80, width: "auto",
                margin: "0 auto 12px", display: "block",
                filter: T.logoFilter,
              }}
            />
            <div style={{ color: T.titulo, fontSize: 20, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>
              Valores de rentabilidade
            </div>
            {nomeEmpreendimento && (
              <div style={{ color: T.subtitulo, fontSize: 12, marginTop: 4, fontFamily: "system-ui, sans-serif" }}>
                {nomeEmpreendimento}
              </div>
            )}
          </div>

          {/* TOTAL INVESTIDO */}
          <div style={{ padding: isDark ? "0" : "12px 16px 0" }}>
            <HeaderRow label="Total investido" value={fmtBRL(totalInvestido)} />
          </div>

          <Divider />

          {/* DADOS DE OCUPAÇÃO */}
          <DataRow label="Diárias praticadas na região" value={fmtBRL(inputs.diaria)} />
          <DataRow label="Ocupação (%)" value={`${ocupacaoPct}%`} />
          <DataRow label="Ocupação (Dias)" value={`${inputs.diasOcupacao}`} />

          <Divider />

          {/* RECEITA BRUTA */}
          <ReceitaRow label="Receita bruta mensal" value={fmtBRL(results.receitaBrutaMensal)} />

          <Divider />

          {/* DESPESAS — maior para menor, valores em amarelo/âmbar */}
          {despesas.map((d) => (
            <DataRow key={d.label} label={d.label} value={fmtBRL(d.value)} valueColor={T.valorDespesa} />
          ))}

          <Divider />

          {/* RESULTADOS */}
          <HighlightRow label="Renda mensal líquida"           value={fmtBRL(results.rendaMensalLiquida)} />
          <HighlightRow label="Renda anual líquida"            value={fmtBRL(results.rendaMensalLiquida * 12)} />
          <HighlightRow label="Retorno sobre investimento A.M" value={fmtPct(retornoAM)} />
          <HighlightRow label="Retorno sobre investimento A.A" value={fmtPct(retornoAA)} />
          <HighlightRow label="Retorno sobre patrimônio A.M"   value={fmtPct(patrimonioAM)} />
          <HighlightRow label="Retorno sobre patrimônio A.A"   value={fmtPct(patrimonioAA)} />

        </div>
      </div>
    </div>
  );
}
