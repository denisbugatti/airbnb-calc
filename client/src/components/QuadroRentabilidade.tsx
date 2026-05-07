/**
 * QuadroRentabilidade.tsx
 * Quadro de rentabilidade — versão clara com hierarquia de cores completa.
 *
 * Paleta:
 *   Fundo card:        #FFFFFF (branco puro)
 *   Fundo página:      #F7F8FA (cinza suave)
 *   Seção destaque:    #FFF5F5 (coral muito claro) para total investido
 *   Seção receita:     #F0FDF4 (verde muito claro)
 *   Seção despesas:    #FAFAFA
 *   Seção resultados:  gradiente coral→verde por importância
 *
 * Hierarquia tipográfica:
 *   Nível 1 (título):  20px bold #111827
 *   Nível 2 (label destaque): 14px semibold #374151
 *   Nível 3 (label secundário): 13px regular #6B7280
 *   Valor primário:    18px bold coral #FF385C / verde #16A34A
 *   Valor secundário:  14px medium #111827
 *   Valor terciário:   13px regular #374151
 */

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import type { CalculatorInputs, CalculatorResults } from "@/lib/calculator";

// ─── Airbnb Logo ──────────────────────────────────────────────────────────────
const AIRBNB_LOGO_URL = "/manus-storage/airbnb-logo_a915ef9c.webp";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  coral:       "#FF385C",
  coralLight:  "#FFF0F2",
  coralMid:    "#FFD6DC",
  green:       "#16A34A",
  greenLight:  "#F0FDF4",
  greenMid:    "#BBF7D0",
  amber:       "#D97706",
  amberLight:  "#FFFBEB",
  slate1:      "#111827",  // texto principal
  slate2:      "#374151",  // texto secundário
  slate3:      "#6B7280",  // texto terciário
  slate4:      "#9CA3AF",  // placeholder
  border:      "#E5E7EB",  // divisor padrão
  borderLight: "#F3F4F6",  // divisor suave
  bg:          "#FFFFFF",  // fundo card
  bgPage:      "#F7F8FA",  // fundo externo
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}
function fmtPct(v: number) {
  return `${v.toFixed(2).replace(".", ",")}%`;
}

// ─── Row: Total Investido (destaque coral) ────────────────────────────────────
function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: T.coralLight,
      border: `1px solid ${T.coralMid}`,
      borderRadius: 10,
      padding: "16px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 4, height: 28, background: T.coral, borderRadius: 2 }} />
        <span style={{ color: T.slate1, fontSize: 15, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>{label}</span>
      </div>
      <span style={{ color: T.coral, fontSize: 20, fontWeight: 800, fontFamily: "system-ui, sans-serif", letterSpacing: "-0.5px" }}>{value}</span>
    </div>
  );
}

// ─── Row: Dados de entrada (neutro) ──────────────────────────────────────────
function DataRow({ label, value, indent = false }: { label: string; value: string; indent?: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: `9px ${indent ? "20px 9px 32px" : "9px 20px"}`,
      borderBottom: `1px solid ${T.borderLight}`,
    }}>
      <span style={{ color: T.slate3, fontSize: 13, fontFamily: "system-ui, sans-serif", maxWidth: "65%" }}>{label}</span>
      <span style={{ color: T.slate2, fontSize: 13.5, fontWeight: 500, fontFamily: "system-ui, sans-serif" }}>{value}</span>
    </div>
  );
}

// ─── Row: Despesa (vermelho suave) ────────────────────────────────────────────
function DespesaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 20px",
      borderBottom: `1px solid ${T.borderLight}`,
    }}>
      <span style={{ color: T.slate3, fontSize: 13, fontFamily: "system-ui, sans-serif", maxWidth: "65%" }}>{label}</span>
      <span style={{ color: T.amber, fontSize: 13.5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>− {value}</span>
    </div>
  );
}

// ─── Row: Receita Bruta (verde destaque) ──────────────────────────────────────
function ReceitaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: T.greenLight,
      border: `1px solid ${T.greenMid}`,
      borderRadius: 10,
      padding: "14px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 4, height: 24, background: T.green, borderRadius: 2 }} />
        <span style={{ color: T.green, fontSize: 14, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>{label}</span>
      </div>
      <span style={{ color: T.green, fontSize: 17, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>{value}</span>
    </div>
  );
}

// ─── Row: Resultado (verde grande) ───────────────────────────────────────────
function ResultRow({ label, value, size = "md" }: { label: string; value: string; size?: "sm" | "md" | "lg" }) {
  const fontSize = size === "lg" ? 18 : size === "md" ? 16 : 14;
  const labelSize = size === "lg" ? 14 : size === "md" ? 13.5 : 13;
  const paddingV = size === "lg" ? 16 : 13;
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: T.greenLight,
      borderLeft: `4px solid ${T.green}`,
      borderRadius: "0 10px 10px 0",
      padding: `${paddingV}px 20px`,
      marginBottom: 3,
    }}>
      <span style={{ color: T.slate2, fontSize: labelSize, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>{label}</span>
      <span style={{ color: T.green, fontSize, fontWeight: 800, fontFamily: "system-ui, sans-serif", letterSpacing: "-0.3px" }}>{value}</span>
    </div>
  );
}

// ─── Row: Retorno % (coral para investimento, azul para patrimônio) ───────────
function RetornoRow({ label, value, variant = "coral" }: { label: string; value: string; variant?: "coral" | "blue" }) {
  const color = variant === "coral" ? T.coral : "#2563EB";
  const bg    = variant === "coral" ? T.coralLight : "#EFF6FF";
  const border = variant === "coral" ? T.coralMid : "#BFDBFE";
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: bg,
      borderLeft: `4px solid ${color}`,
      borderRadius: "0 10px 10px 0",
      padding: "13px 20px",
      marginBottom: 3,
    }}>
      <span style={{ color: T.slate2, fontSize: 13.5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>{label}</span>
      <span style={{ color, fontSize: 16, fontWeight: 800, fontFamily: "system-ui, sans-serif" }}>{value}</span>
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
      color: T.slate4, textTransform: "uppercase",
      padding: "10px 20px 4px",
      fontFamily: "system-ui, sans-serif",
    }}>
      {text}
    </div>
  );
}

function Divider({ strong = false }: { strong?: boolean }) {
  return <div style={{ height: strong ? 2 : 1, background: strong ? T.border : T.borderLight, margin: strong ? "12px 0" : "4px 0" }} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  inputs: CalculatorInputs;
  results: CalculatorResults;
  incluiDecoracao: boolean;
  nomeEmpreendimento?: string;
}

export function QuadroRentabilidade({ inputs, results, incluiDecoracao, nomeEmpreendimento }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const totalInvestido = inputs.capitalProprio + (incluiDecoracao ? (inputs.mobilia || 0) : 0);
  const ocupacaoPct    = inputs.diasOcupacao > 0 ? Math.round((inputs.diasOcupacao / 30) * 100) : 0;
  const iptuWifiAguaLuz = inputs.iptuMensal + inputs.wifi + inputs.agua + inputs.luz;
  const admSeguroPct   = Math.round(inputs.taxaAdminSeguro * 100);
  const prazoAnos      = Math.round(inputs.prazoMeses / 12);
  const taxaMensal     = (inputs.taxaJurosMensal * 100).toFixed(1).replace(".", ",");

  const retornoAM  = totalInvestido > 0 ? (results.rendaMensalLiquida / totalInvestido) * 100 : 0;
  const retornoAA  = retornoAM * 12;
  const patrimonioAM = inputs.valorImovel > 0 ? (results.rendaMensalLiquida / inputs.valorImovel) * 100 : 0;
  const patrimonioAA = patrimonioAM * 12;

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: T.bgPage,
      });
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

  return (
    <div className="space-y-3">
      {/* Botão exportar */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: `linear-gradient(135deg, ${T.coral}, #e0274a)`,
            color: "#fff",
            boxShadow: "0 2px 8px rgba(255,56,92,0.35)",
            opacity: exporting ? 0.7 : 1,
          }}
        >
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {exporting ? "Exportando..." : "Exportar PNG"}
        </button>
      </div>

      {/* ── Card exportável ── */}
      <div
        ref={cardRef}
        style={{
          background: T.bgPage,
          borderRadius: 20,
          padding: "28px 24px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Card interno */}
        <div style={{
          background: T.bg,
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}>

          {/* ── HEADER ── */}
          <div style={{
            background: "linear-gradient(135deg, #fff 0%, #FFF5F5 100%)",
            borderBottom: `2px solid ${T.border}`,
            padding: "28px 24px 20px",
            textAlign: "center",
          }}>
            <img
              src={AIRBNB_LOGO_URL}
              alt="Airbnb"
              style={{ height: 72, width: "auto", margin: "0 auto 16px", display: "block" }}
            />
            <div style={{ color: T.slate1, fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", fontFamily: "system-ui, sans-serif" }}>
              Valores de rentabilidade
            </div>
            {nomeEmpreendimento && (
              <div style={{
                display: "inline-block",
                marginTop: 8,
                padding: "3px 12px",
                background: T.coralLight,
                border: `1px solid ${T.coralMid}`,
                borderRadius: 20,
                color: T.coral,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "system-ui, sans-serif",
              }}>
                {nomeEmpreendimento}
              </div>
            )}
          </div>

          {/* ── TOTAL INVESTIDO ── */}
          <div style={{ padding: "16px 20px 12px" }}>
            <TotalRow label="Total investido" value={fmtBRL(totalInvestido)} />
          </div>

          <Divider strong />

          {/* ── OCUPAÇÃO ── */}
          <SectionLabel text="Dados de ocupação" />
          <DataRow label="Diárias praticadas na região" value={fmtBRL(inputs.diaria)} />
          <DataRow label="Ocupação (%)" value={`${ocupacaoPct}%`} />
          <DataRow label="Ocupação (Dias)" value={`${inputs.diasOcupacao} dias`} />

          <Divider strong />

          {/* ── RECEITA BRUTA ── */}
          <div style={{ padding: "12px 20px 8px" }}>
            <ReceitaRow label="Receita bruta mensal" value={fmtBRL(results.receitaBrutaMensal)} />
          </div>

          <Divider strong />

          {/* ── DESPESAS ── */}
          <SectionLabel text="Despesas mensais" />
          <DespesaRow
            label={`Condomínio (R$${Math.round(inputs.condominio / (inputs.areaM2 || 1))}/m²)`}
            value={fmtBRL(inputs.condominio)}
          />
          <DespesaRow label="IPTU, Wi-Fi, água e luz" value={fmtBRL(iptuWifiAguaLuz)} />
          <DespesaRow label={`Administração + Seguro (${admSeguroPct}%)`} value={fmtBRL(results.adminSeguro)} />
          {results.parcelaFinanciamento > 0 && (
            <DespesaRow
              label={`Parcela financiamento (${prazoAnos} anos · ${taxaMensal}% a.m.)`}
              value={fmtBRL(results.parcelaFinanciamento)}
            />
          )}

          <Divider strong />

          {/* ── RESULTADOS ── */}
          <SectionLabel text="Resultado mensal" />
          <div style={{ padding: "8px 20px 4px" }}>
            <ResultRow label="Renda mensal líquida"  value={fmtBRL(results.rendaMensalLiquida)} size="lg" />
            <ResultRow label="Renda anual líquida"   value={fmtBRL(results.rendaMensalLiquida * 12)} size="md" />
          </div>

          <Divider strong />

          {/* ── RETORNO SOBRE INVESTIMENTO ── */}
          <SectionLabel text="Retorno sobre investimento (capital próprio)" />
          <div style={{ padding: "8px 20px 4px" }}>
            <RetornoRow label="Retorno sobre investimento A.M" value={fmtPct(retornoAM)} variant="coral" />
            <RetornoRow label="Retorno sobre investimento A.A" value={fmtPct(retornoAA)} variant="coral" />
          </div>

          <Divider strong />

          {/* ── RETORNO SOBRE PATRIMÔNIO ── */}
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
