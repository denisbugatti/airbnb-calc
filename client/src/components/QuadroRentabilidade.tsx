/**
 * QuadroRentabilidade.tsx
 * Quadro de rentabilidade exportável em PNG — peça de apresentação para clientes.
 * Exporta SEMPRE em fundo claro (independente do tema do site): logo Airbnb no topo,
 * números com a base corrigida (capital próprio + decoração) e rodapé Vitacon.
 */

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import type { CalculatorInputs, CalculatorResults } from "@/lib/calculator";

const AIRBNB_LOGO_URL = "/airbnb-logo.svg";

// ─── Paleta fixa do quadro (peça de exportação, não segue o tema) ────────────
const Q = {
  bgOuter: "#F5F5F5",
  bgCard: "#FFFFFF",
  cardShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
  titulo: "#0A0A0B",
  subtitulo: "#999999",
  label: "#666666",
  valor: "#0A0A0B",
  despesa: "#B45309",
  receita: "#0E8A4A",
  azul: "#2800FF",
  azulBg: "rgba(40,0,255,0.05)",
  azulBorda: "rgba(40,0,255,0.18)",
  verdeBg: "rgba(14,138,74,0.06)",
  verdeBorda: "3px solid #0E8A4A",
  divider: "#ECECEC",
  fontSans: '"Avant Garde", "Century Gothic", Futura, sans-serif',
  fontMono: '"JetBrains Mono", ui-monospace, monospace',
};

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
  nomeEmpreendimento?: string;
}

export function QuadroRentabilidade({ inputs, results, nomeEmpreendimento }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const totalInvestido = results.capitalProprioTotal;
  const ocupacaoPct = inputs.diasOcupacao > 0 ? Math.round((inputs.diasOcupacao / 30) * 100) : 0;
  const iptuWifiAguaLuz = inputs.iptuMensal + inputs.wifi + inputs.agua + inputs.luz;
  const admSeguroPct = Math.round(inputs.taxaAdminSeguro * 100);
  const prazoAnos = Math.round(inputs.prazoMeses / 12);
  const taxaMensal = (inputs.taxaJurosMensal * 100).toFixed(1).replace(".", ",");
  const okPct = results.temReceita && results.temBaseCapital;

  // Despesas ordenadas do maior para o menor (linhas zeradas de custos opcionais ficam de fora)
  const despesas = [
    { label: "Valor estimado do condomínio", value: inputs.condominio },
    { label: "IPTU, WIFI, água e luz", value: iptuWifiAguaLuz },
    { label: `Administração + Seguro (${admSeguroPct}%)`, value: results.adminSeguro },
    ...(results.parcelaFinanciamento > 0
      ? [{ label: `Parcela do financiamento (${prazoAnos} anos com taxa ${taxaMensal}%)`, value: results.parcelaFinanciamento }]
      : []),
    ...(results.taxaPlataformaValor > 0
      ? [{ label: `Taxa da plataforma (${Math.round(inputs.taxaPlataforma * 100)}%)`, value: results.taxaPlataformaValor }]
      : []),
    ...(results.custoLimpezaMensal > 0
      ? [{ label: `Limpeza (${inputs.checkInsMes} check-ins/mês)`, value: results.custoLimpezaMensal }]
      : []),
    ...(results.gestaoValor > 0
      ? [{ label: `Gestão (${Math.round(inputs.taxaGestao * 100)}%)`, value: results.gestaoValor }]
      : []),
  ].sort((a, b) => b.value - a.value);

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: Q.bgOuter });
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

  // ── Sub-components ──────────────────────────────────────────────────────────
  const Divider = () => <div style={{ height: 1, background: Q.divider, margin: "6px 0" }} />;

  const DataRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "10px 20px" }}>
      <span style={{ color: Q.label, fontSize: 13, fontFamily: Q.fontSans }}>{label}</span>
      <span style={{ color: valueColor ?? Q.valor, fontSize: 13, fontWeight: 500, fontFamily: Q.fontMono, whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );

  const TotalRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
      background: Q.azulBg, border: `1px solid ${Q.azulBorda}`,
      borderRadius: 10, padding: "14px 20px", margin: "0 12px 4px",
    }}>
      <span style={{ color: Q.titulo, fontSize: 14, fontWeight: 600, fontFamily: Q.fontSans }}>{label}</span>
      <span style={{ color: Q.azul, fontSize: 18, fontWeight: 700, fontFamily: Q.fontMono, whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );

  const HighlightRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
      borderLeft: Q.verdeBorda, background: Q.verdeBg,
      borderRadius: "0 8px 8px 0", padding: "12px 20px", marginBottom: 2,
    }}>
      <span style={{ color: Q.receita, fontSize: 13.5, fontWeight: 600, fontFamily: Q.fontSans }}>{label}</span>
      <span style={{ color: Q.receita, fontSize: 15, fontWeight: 700, fontFamily: Q.fontMono, whiteSpace: "nowrap" }}>{value}</span>
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
          className="press flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
          style={{ background: Q.azul, color: "#fff", boxShadow: "0 2px 8px rgba(40,0,255,0.3)", opacity: exporting ? 0.7 : 1 }}
        >
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {exporting ? "Exportando..." : "Exportar PNG"}
        </button>
      </div>

      {/* Card exportável */}
      <div ref={cardRef} style={{ background: Q.bgOuter, borderRadius: 16, padding: 20, fontFamily: Q.fontSans, minWidth: 340 }}>
        <div style={{ background: Q.bgCard, borderRadius: 14, boxShadow: Q.cardShadow, overflow: "hidden", padding: "0 0 4px" }}>

          {/* HEADER */}
          <div style={{ borderBottom: `1px solid ${Q.divider}`, padding: "24px 24px 18px", textAlign: "center" }}>
            <img
              src={AIRBNB_LOGO_URL}
              alt="Airbnb"
              style={{ height: 52, width: "auto", margin: "0 auto 10px", display: "block" }}
            />
            <div style={{ color: Q.titulo, fontSize: 19, fontWeight: 600, fontFamily: Q.fontSans }}>
              Valores de rentabilidade
            </div>
            {nomeEmpreendimento && (
              <div style={{ color: Q.subtitulo, fontSize: 11, marginTop: 4, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: Q.fontMono }}>
                {nomeEmpreendimento}
              </div>
            )}
          </div>

          {/* TOTAL INVESTIDO */}
          <div style={{ padding: "14px 0 0" }}>
            <TotalRow label="Total investido" value={fmtBRL(totalInvestido)} />
          </div>

          <Divider />

          {/* OCUPAÇÃO */}
          <DataRow label="Diárias praticadas na região" value={fmtBRL(inputs.diaria)} />
          <DataRow label="Ocupação (%)" value={`${ocupacaoPct}%`} />
          <DataRow label="Ocupação (Dias)" value={`${inputs.diasOcupacao}`} />

          <Divider />

          {/* RECEITA BRUTA */}
          <HighlightRow label="Receita bruta mensal" value={fmtBRL(results.receitaBrutaMensal)} />

          <Divider />

          {/* DESPESAS */}
          {despesas.map((d) => (
            <DataRow key={d.label} label={d.label} value={fmtBRL(d.value)} valueColor={Q.despesa} />
          ))}

          <Divider />

          {/* RESULTADOS */}
          <HighlightRow label="Renda mensal líquida" value={fmtBRL(results.rendaMensalLiquida)} />
          <HighlightRow label="Renda anual líquida" value={fmtBRL(results.rendaMensalLiquida * 12)} />
          <HighlightRow label="Retorno sobre investimento A.M" value={okPct ? fmtPct(results.ganhoFinanceiroMensal) : "—"} />
          <HighlightRow label="Retorno sobre investimento A.A" value={okPct ? fmtPct(results.rentabilidadeAnual) : "—"} />
          <HighlightRow label="Retorno sobre patrimônio A.M" value={okPct ? fmtPct(results.retornoPatrimonioMensal) : "—"} />
          <HighlightRow label="Retorno sobre patrimônio A.A" value={okPct ? fmtPct(results.retornoPatrimonioAnual) : "—"} />

          {/* RODAPÉ VITACON */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px 8px", opacity: 0.8 }}>
            <img
              src="/vitacon-logo.png"
              alt="Vitacon"
              style={{ height: 13, width: "auto", filter: "invert(1)" }}
            />
            <span style={{ color: Q.subtitulo, fontSize: 10, fontFamily: Q.fontMono }}>
              Simulação — {new Date().toLocaleDateString("pt-BR")}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
