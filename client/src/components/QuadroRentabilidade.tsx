/**
 * QuadroRentabilidade.tsx
 * Quadro de rentabilidade estilizado (template Airbnb) com exportação PNG.
 * Design: fundo dark navy, bordas verdes, logo Airbnb — fiel ao template fornecido.
 */

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import type { CalculatorInputs, CalculatorResults } from "@/lib/calculator";
import { formatCurrency } from "@/lib/calculator";

// ─── Airbnb Logo Image ──────────────────────────────────────────────────────────
const AIRBNB_LOGO_URL = "/manus-storage/airbnb-logo_a915ef9c.webp";

// ─── Row Components ───────────────────────────────────────────────────────────
function HeaderRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "rgba(255,255,255,0.07)",
      borderRadius: 8,
      padding: "14px 20px",
      marginBottom: 2,
    }}>
      <span style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 500, fontFamily: "'Geist', sans-serif" }}>{label}</span>
      <span style={{ color: "#22c55e", fontSize: 18, fontWeight: 700, fontFamily: "'Geist Mono', monospace" }}>{value}</span>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 20px",
    }}>
      <span style={{ color: "#94a3b8", fontSize: 13.5, fontFamily: "'Geist', sans-serif" }}>{label}</span>
      <span style={{ color: "#e2e8f0", fontSize: 13.5, fontWeight: 500, fontFamily: "'Geist Mono', monospace" }}>{value}</span>
    </div>
  );
}

function HighlightRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderLeft: "3px solid #22c55e",
      background: "rgba(34,197,94,0.07)",
      borderRadius: "0 8px 8px 0",
      padding: "13px 20px",
      marginBottom: 2,
    }}>
      <span style={{ color: "#22c55e", fontSize: 14.5, fontWeight: 600, fontFamily: "'Geist', sans-serif" }}>{label}</span>
      <span style={{ color: "#22c55e", fontSize: 16, fontWeight: 700, fontFamily: "'Geist Mono', monospace" }}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 0" }} />;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}
function fmtPct(v: number) {
  return `${v.toFixed(2).replace(".", ",")}%`;
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

  // Total investido: capital próprio + mobília (se incluir decoração)
  const totalInvestido = inputs.capitalProprio + (incluiDecoracao ? (inputs.mobilia || 0) : 0);

  // Campos derivados
  const ocupacaoPct = inputs.diasOcupacao > 0 ? Math.round((inputs.diasOcupacao / 30) * 100) : 0;
  const iptuWifiAguaLuz = inputs.iptuMensal + inputs.wifi + inputs.agua + inputs.luz;
  const admSeguroPct = Math.round(inputs.taxaAdminSeguro * 100);
  const prazoAnos = Math.round(inputs.prazoMeses / 12);
  const taxaMensal = (inputs.taxaJurosMensal * 100).toFixed(1).replace(".", ",");

  // Retorno A.M e A.A sobre total investido (capital próprio)
  const retornoAM = totalInvestido > 0 ? (results.rendaMensalLiquida / totalInvestido) * 100 : 0;
  const retornoAA = retornoAM * 12;

  // Retorno sobre patrimônio A.M e A.A (valor total do imóvel)
  const patrimonioAM = inputs.valorImovel > 0 ? (results.rendaMensalLiquida / inputs.valorImovel) * 100 : 0;
  const patrimonioAA = patrimonioAM * 12;

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#0f172a",
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
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "#fff",
            boxShadow: "0 2px 8px rgba(34,197,94,0.35)",
            opacity: exporting ? 0.7 : 1,
          }}
        >
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {exporting ? "Exportando..." : "Exportar PNG"}
        </button>
      </div>

      {/* Card exportável */}
      <div
        ref={cardRef}
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #0d1b2e 60%, #0a1628 100%)",
          borderRadius: 16,
          padding: "32px 28px",
          fontFamily: "'Geist', 'Inter', sans-serif",
          minWidth: 340,
        }}
      >
        {/* Header: logo + título */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img
            src={AIRBNB_LOGO_URL}
            alt="Airbnb"
            style={{ height: 80, width: "auto", margin: "0 auto 12px", display: "block" }}
          />
          <div style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, fontFamily: "'Geist', sans-serif" }}>
            Valores de rentabilidade
          </div>
          {nomeEmpreendimento && (
            <div style={{ color: "#64748b", fontSize: 12, marginTop: 4, fontFamily: "'Geist', sans-serif" }}>
              {nomeEmpreendimento}
            </div>
          )}
        </div>

        {/* Total investido */}
        <HeaderRow label="Total investido" value={fmtBRL(totalInvestido)} />

        <Divider />

        {/* Dados de entrada */}
        <DataRow label="Diárias praticadas na região" value={fmtBRL(inputs.diaria)} />
        <DataRow label={`Ocupação (%)`} value={`${ocupacaoPct}%`} />
        <DataRow label="Ocupação (Dias)" value={`${inputs.diasOcupacao}`} />

        <Divider />

        {/* Receita bruta */}
        <HighlightRow label="Receita bruta mensal" value={fmtBRL(results.receitaBrutaMensal)} />

        <Divider />

        {/* Despesas */}
        <DataRow
          label={`Valor estimado do condomínio (R$${Math.round(inputs.condominio / (inputs.areaM2 || 1))}/M²)`}
          value={fmtBRL(inputs.condominio)}
        />
        <DataRow label="IPTU, WIFI, água e luz" value={fmtBRL(iptuWifiAguaLuz)} />
        <DataRow label={`Administração + Seguro (${admSeguroPct}%)`} value={fmtBRL(results.adminSeguro)} />
        {results.parcelaFinanciamento > 0 && (
          <DataRow
            label={`Parcela do financiamento (${prazoAnos} anos com taxa ${taxaMensal}%)`}
            value={fmtBRL(results.parcelaFinanciamento)}
          />
        )}

        <Divider />

        {/* Resultados */}
        <HighlightRow label="Renda mensal líquida" value={fmtBRL(results.rendaMensalLiquida)} />
        <HighlightRow label="Renda anual líquida" value={fmtBRL(results.rendaMensalLiquida * 12)} />
        <HighlightRow label="Retorno sobre investimento A.M" value={fmtPct(retornoAM)} />
        <HighlightRow label="Retorno sobre investimento A.A" value={fmtPct(retornoAA)} />
        <HighlightRow label="Retorno sobre patrimônio A.M" value={fmtPct(patrimonioAM)} />
        <HighlightRow label="Retorno sobre patrimônio A.A" value={fmtPct(patrimonioAA)} />
      </div>
    </div>
  );
}
