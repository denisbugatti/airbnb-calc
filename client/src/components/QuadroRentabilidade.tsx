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

// ─── Airbnb Logo SVG ──────────────────────────────────────────────────────────
function AirbnbLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1000 1000" fill="#FF385C" xmlns="http://www.w3.org/2000/svg">
      <path d="M499.3 736.7c-51-64-81-120.1-91-168.1-10-39-6-70 11-93 18-24 45-37 80-37s62 13 80 37c17 23 21 54 11 93-11 49-41 105-91 168.1zm362.2 43c-7 47-39 86-83 105-85 37-169-22-241-102 119-149 133-265 84-340-26-39-68-60-122-60s-96 21-122 60c-49 75-35 191 84 340-72 80-156 139-241 102-44-19-76-58-83-105-7-52 11-105 73-174 45-49 109-104 194-165C484.2 354.6 498.3 349 500 349s15.8 5.6 95.8 61.7c85 61 149 116 194 165 62 69 80 122 73 174h-1.3z"/>
    </svg>
  );
}

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

  // Retorno A.M e A.A sobre total investido
  const retornoAM = totalInvestido > 0 ? (results.rendaMensalLiquida / totalInvestido) * 100 : 0;
  const retornoAA = retornoAM * 12;

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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            <AirbnbLogo size={26} />
            <span style={{ color: "#FF385C", fontSize: 22, fontWeight: 700, fontFamily: "'Geist', sans-serif", letterSpacing: "-0.5px" }}>
              airbnb
            </span>
          </div>
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
      </div>
    </div>
  );
}
