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
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 2C13.5 2 11.5 4.2 11.5 6.9c0 1.7.7 3.3 1.9 4.8L16 14.5l2.6-2.8c1.2-1.5 1.9-3.1 1.9-4.8C20.5 4.2 18.5 2 16 2zm0 2c1.4 0 2.5 1.3 2.5 2.9 0 1.2-.5 2.4-1.4 3.6L16 11.9l-1.1-1.4c-.9-1.2-1.4-2.4-1.4-3.6C13.5 5.3 14.6 4 16 4z"
        fill="#FF385C"
      />
      <path
        d="M8.5 14.5C6.6 14.5 5 16.1 5 18c0 2.5 2.1 4.5 5.5 6.5.9.5 1.8 1 2.8 1.4C11.1 27.5 9.5 28.5 8 28.5c-1 0-1.5-.3-1.5-.3l-.5 1.8s.8.5 2 .5c2 0 3.8-1.3 5-2.8 1.2 1.5 3 2.8 5 2.8s3.8-1.3 5-2.8c1.2 1.5 3 2.8 5 2.8 1.2 0 2-.5 2-.5l-.5-1.8s-.5.3-1.5.3c-1.5 0-3.1-1-5.3-2.6 1-.4 1.9-.9 2.8-1.4C29.9 22.5 32 20.5 32 18c0-1.9-1.6-3.5-3.5-3.5-1.2 0-2.3.6-3 1.5-.7-1.8-2.4-3-4.5-3-1.5 0-2.8.7-3.7 1.7-.2-.1-.4-.2-.6-.2-.2 0-.4.1-.6.2-.9-1-2.2-1.7-3.7-1.7-2.1 0-3.8 1.2-4.5 3-.7-.9-1.8-1.5-3-1.5zm0 2c.8 0 1.5.4 1.9 1.1l.6 1.1.6-1.1c.5-1.1 1.6-1.8 2.9-1.8 1.3 0 2.4.7 2.9 1.8l.6 1.1.6-1.1c.4-.7 1.1-1.1 1.9-1.1s1.5.4 1.9 1.1l.6 1.1.6-1.1c.5-1.1 1.6-1.8 2.9-1.8 1.3 0 2.4.7 2.9 1.8l.6 1.1.6-1.1c.4-.7 1.1-1.1 1.9-1.1.8 0 1.5.7 1.5 1.5 0 1.7-1.6 3.3-4.5 5-.9.5-1.9 1-2.9 1.4-.9-.4-1.8-.8-2.6-1.3-1.7-1-3-2.1-3.5-3.1-.5 1-1.8 2.1-3.5 3.1-.8.5-1.7.9-2.6 1.3-1-.4-2-.9-2.9-1.4C7.1 21.3 5.5 19.7 5.5 18c0-.8.7-1.5 1.5-1.5 .8 0 1.5.4 1.9 1.1l.6 1.1.6-1.1c.4-.7 1.1-1.1 1.9-1.1z"
        fill="#FF385C"
      />
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
