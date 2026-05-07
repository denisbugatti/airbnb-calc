/**
 * QuadroRentabilidade.tsx
 * Quadro de rentabilidade com tema adaptativo (claro/escuro) via prop isDark.
 * Segue o toggle de tema do site automaticamente.
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

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  inputs: CalculatorInputs;
  results: CalculatorResults;
  incluiDecoracao: boolean;
  nomeEmpreendimento?: string;
  isDark?: boolean;
}

export function QuadroRentabilidade({ inputs, results, incluiDecoracao, nomeEmpreendimento, isDark = false }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // ── Tokens adaptativos ────────────────────────────────────────────────────
  const D = isDark ? {
    coral:       "#FF385C",
    coralLight:  "rgba(255,56,92,0.12)",
    coralMid:    "rgba(255,56,92,0.28)",
    green:       "#22c55e",
    greenLight:  "rgba(34,197,94,0.10)",
    greenMid:    "rgba(34,197,94,0.28)",
    amber:       "#f59e0b",
    blue:        "#60a5fa",
    blueLight:   "rgba(96,165,250,0.10)",
    blueBorder:  "rgba(96,165,250,0.28)",
    slate1:      "#f1f5f9",
    slate2:      "#cbd5e1",
    slate3:      "#94a3b8",
    slate4:      "#64748b",
    border:      "rgba(255,255,255,0.10)",
    borderLight: "rgba(255,255,255,0.05)",
    bg:          "#0f172a",
    bgPage:      "#0a1120",
    bgHeader:    "linear-gradient(135deg, #0f172a 0%, #1e0a14 100%)",
    exportBg:    "#0a1120",
    shadow:      "0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)",
  } : {
    coral:       "#FF385C",
    coralLight:  "#FFF0F2",
    coralMid:    "#FFD6DC",
    green:       "#16A34A",
    greenLight:  "#F0FDF4",
    greenMid:    "#BBF7D0",
    amber:       "#D97706",
    blue:        "#2563EB",
    blueLight:   "#EFF6FF",
    blueBorder:  "#BFDBFE",
    slate1:      "#111827",
    slate2:      "#374151",
    slate3:      "#6B7280",
    slate4:      "#9CA3AF",
    border:      "#E5E7EB",
    borderLight: "#F3F4F6",
    bg:          "#FFFFFF",
    bgPage:      "#F7F8FA",
    bgHeader:    "linear-gradient(135deg, #fff 0%, #FFF5F5 100%)",
    exportBg:    "#F7F8FA",
    shadow:      "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
  };

  // ── Cálculos ──────────────────────────────────────────────────────────────
  const totalInvestido  = inputs.capitalProprio + (incluiDecoracao ? (inputs.mobilia || 0) : 0);
  const ocupacaoPct     = inputs.diasOcupacao > 0 ? Math.round((inputs.diasOcupacao / 30) * 100) : 0;
  const iptuWifiAguaLuz = inputs.iptuMensal + inputs.wifi + inputs.agua + inputs.luz;
  const admSeguroPct    = Math.round(inputs.taxaAdminSeguro * 100);
  const prazoAnos       = Math.round(inputs.prazoMeses / 12);
  const taxaMensal      = (inputs.taxaJurosMensal * 100).toFixed(1).replace(".", ",");
  const retornoAM       = totalInvestido > 0 ? (results.rendaMensalLiquida / totalInvestido) * 100 : 0;
  const retornoAA       = retornoAM * 12;
  const patrimonioAM    = inputs.valorImovel > 0 ? (results.rendaMensalLiquida / inputs.valorImovel) * 100 : 0;
  const patrimonioAA    = patrimonioAM * 12;

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: D.exportBg });
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

  // ── Sub-components inline (usam D) ────────────────────────────────────────
  const SectionLabel = ({ text }: { text: string }) => (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: D.slate4,
      textTransform: "uppercase", padding: "10px 20px 4px", fontFamily: "system-ui, sans-serif" }}>
      {text}
    </div>
  );

  const Divider = ({ strong = false }: { strong?: boolean }) => (
    <div style={{ height: strong ? 2 : 1, background: strong ? D.border : D.borderLight, margin: strong ? "12px 0" : "4px 0" }} />
  );

  const TotalRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      background: D.coralLight, border: `1px solid ${D.coralMid}`, borderRadius: 10, padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 4, height: 28, background: D.coral, borderRadius: 2 }} />
        <span style={{ color: D.slate1, fontSize: 15, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>{label}</span>
      </div>
      <span style={{ color: D.coral, fontSize: 20, fontWeight: 800, fontFamily: "system-ui, sans-serif", letterSpacing: "-0.5px" }}>{value}</span>
    </div>
  );

  const DataRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 20px", borderBottom: `1px solid ${D.borderLight}` }}>
      <span style={{ color: D.slate3, fontSize: 13, fontFamily: "system-ui, sans-serif", maxWidth: "65%" }}>{label}</span>
      <span style={{ color: D.slate2, fontSize: 13.5, fontWeight: 500, fontFamily: "system-ui, sans-serif" }}>{value}</span>
    </div>
  );

  const DespesaRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 20px", borderBottom: `1px solid ${D.borderLight}` }}>
      <span style={{ color: D.slate3, fontSize: 13, fontFamily: "system-ui, sans-serif", maxWidth: "65%" }}>{label}</span>
      <span style={{ color: D.amber, fontSize: 13.5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>− {value}</span>
    </div>
  );

  const ReceitaRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      background: D.greenLight, border: `1px solid ${D.greenMid}`, borderRadius: 10, padding: "14px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 4, height: 24, background: D.green, borderRadius: 2 }} />
        <span style={{ color: D.green, fontSize: 14, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>{label}</span>
      </div>
      <span style={{ color: D.green, fontSize: 17, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>{value}</span>
    </div>
  );

  const ResultRow = ({ label, value, size = "md" }: { label: string; value: string; size?: "sm" | "md" | "lg" }) => {
    const fs = size === "lg" ? 18 : size === "md" ? 16 : 14;
    const ls = size === "lg" ? 14 : 13.5;
    const pv = size === "lg" ? 16 : 13;
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        background: D.greenLight, borderLeft: `4px solid ${D.green}`, borderRadius: "0 10px 10px 0",
        padding: `${pv}px 20px`, marginBottom: 3 }}>
        <span style={{ color: D.slate2, fontSize: ls, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>{label}</span>
        <span style={{ color: D.green, fontSize: fs, fontWeight: 800, fontFamily: "system-ui, sans-serif", letterSpacing: "-0.3px" }}>{value}</span>
      </div>
    );
  };

  const RetornoRow = ({ label, value, variant = "coral" }: { label: string; value: string; variant?: "coral" | "blue" }) => {
    const color  = variant === "coral" ? D.coral : D.blue;
    const bg     = variant === "coral" ? D.coralLight : D.blueLight;
    const border = variant === "coral" ? D.coralMid : D.blueBorder;
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        background: bg, borderLeft: `4px solid ${color}`, borderRadius: "0 10px 10px 0",
        padding: "13px 20px", marginBottom: 3 }}>
        <span style={{ color: D.slate2, fontSize: 13.5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>{label}</span>
        <span style={{ color, fontSize: 16, fontWeight: 800, fontFamily: "system-ui, sans-serif" }}>{value}</span>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Botão exportar */}
      <div className="flex justify-end">
        <button onClick={handleExport} disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ background: `linear-gradient(135deg, ${D.coral}, #e0274a)`, color: "#fff",
            boxShadow: "0 2px 8px rgba(255,56,92,0.35)", opacity: exporting ? 0.7 : 1 }}>
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {exporting ? "Exportando..." : "Exportar PNG"}
        </button>
      </div>

      {/* Card exportável */}
      <div ref={cardRef} style={{ background: D.bgPage, borderRadius: 20, padding: "28px 24px",
        fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ background: D.bg, borderRadius: 16, boxShadow: D.shadow, overflow: "hidden" }}>

          {/* HEADER */}
          <div style={{ background: D.bgHeader, borderBottom: `2px solid ${D.border}`,
            padding: "28px 24px 20px", textAlign: "center" }}>
            <img src={AIRBNB_LOGO_URL} alt="Airbnb"
              style={{ height: 72, width: "auto", margin: "0 auto 16px", display: "block",
                filter: isDark ? "brightness(0) invert(1)" : "none" }} />
            <div style={{ color: D.slate1, fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px",
              fontFamily: "system-ui, sans-serif" }}>
              Valores de rentabilidade
            </div>
            {nomeEmpreendimento && (
              <div style={{ display: "inline-block", marginTop: 8, padding: "3px 12px",
                background: D.coralLight, border: `1px solid ${D.coralMid}`, borderRadius: 20,
                color: D.coral, fontSize: 12, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>
                {nomeEmpreendimento}
              </div>
            )}
          </div>

          {/* TOTAL INVESTIDO */}
          <div style={{ padding: "16px 20px 12px" }}>
            <TotalRow label="Total investido" value={fmtBRL(totalInvestido)} />
          </div>
          <Divider strong />

          {/* OCUPAÇÃO */}
          <SectionLabel text="Dados de ocupação" />
          <DataRow label="Diárias praticadas na região" value={fmtBRL(inputs.diaria)} />
          <DataRow label="Ocupação (%)" value={`${ocupacaoPct}%`} />
          <DataRow label="Ocupação (Dias)" value={`${inputs.diasOcupacao} dias`} />
          <Divider strong />

          {/* RECEITA BRUTA */}
          <div style={{ padding: "12px 20px 8px" }}>
            <ReceitaRow label="Receita bruta mensal" value={fmtBRL(results.receitaBrutaMensal)} />
          </div>
          <Divider strong />

          {/* DESPESAS */}
          <SectionLabel text="Despesas mensais" />
          <DespesaRow label={`Condomínio (R$${Math.round(inputs.condominio / (inputs.areaM2 || 1))}/m²)`} value={fmtBRL(inputs.condominio)} />
          <DespesaRow label="IPTU, Wi-Fi, água e luz" value={fmtBRL(iptuWifiAguaLuz)} />
          <DespesaRow label={`Administração + Seguro (${admSeguroPct}%)`} value={fmtBRL(results.adminSeguro)} />
          {results.parcelaFinanciamento > 0 && (
            <DespesaRow label={`Parcela financiamento (${prazoAnos} anos · ${taxaMensal}% a.m.)`} value={fmtBRL(results.parcelaFinanciamento)} />
          )}
          <Divider strong />

          {/* RESULTADOS */}
          <SectionLabel text="Resultado mensal" />
          <div style={{ padding: "8px 20px 4px" }}>
            <ResultRow label="Renda mensal líquida"  value={fmtBRL(results.rendaMensalLiquida)} size="lg" />
            <ResultRow label="Renda anual líquida"   value={fmtBRL(results.rendaMensalLiquida * 12)} size="md" />
          </div>
          <Divider strong />

          {/* RETORNO SOBRE INVESTIMENTO */}
          <SectionLabel text="Retorno sobre investimento (capital próprio)" />
          <div style={{ padding: "8px 20px 4px" }}>
            <RetornoRow label="Retorno sobre investimento A.M" value={fmtPct(retornoAM)} variant="coral" />
            <RetornoRow label="Retorno sobre investimento A.A" value={fmtPct(retornoAA)} variant="coral" />
          </div>
          <Divider strong />

          {/* RETORNO SOBRE PATRIMÔNIO */}
          <SectionLabel text="Retorno sobre patrimônio (valor total do imóvel)" />
          <div style={{ padding: "8px 20px 16px" }}>
            <RetornoRow label="Retorno sobre patrimônio A.M" value={fmtPct(patrimonioAM)} variant="blue" />
            <RetornoRow label="Retorno sobre patrimônio A.A" value={fmtPct(patrimonioAA)} variant="blue" />
          </div>

        </div>
      </div>
    </div>
  );
}
