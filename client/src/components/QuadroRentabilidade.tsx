/**
 * QuadroRentabilidade.tsx
 * "Simulação de Rentabilidade" — fiel ao brochure ON Paulista (Claude Design).
 * Extrato sobre preto: linhas hairline, despesas em azul com "−",
 * receita destacada com borda azul e renda anual como faixa sólida #2800FF.
 * Exporta em PNG (peça de apresentação).
 */

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import type { CalculatorInputs, CalculatorResults } from "@/lib/calculator";

// ─── Paleta fixa do quadro (brochure — não segue o tema do site) ─────────────
const Q = {
  bg: "#000000",
  banda: "#1A1A1A",
  azul: "#2800FF",
  azulTexto: "#5A43FF",
  azulBg: "rgba(40,0,255,0.16)",
  branco: "#FFFFFF",
  cinza: "#B3B3B3",
  cinzaEscuro: "#898A8E",
  hairline: "#2A2A2A",
  fontDisplay: 'var(--font-display)',
  fontSans: 'var(--font-sans)',
  fontMono: 'var(--font-mono)',
};

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}
function fmtPct(v: number) {
  return `${v.toFixed(2).replace(".", ",")}%`;
}

interface Props {
  inputs: CalculatorInputs;
  results: CalculatorResults;
  nomeEmpreendimento?: string;
}

export function QuadroRentabilidade({ inputs, results, nomeEmpreendimento }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const ocupacaoPct = inputs.diasOcupacao > 0 ? Math.round((inputs.diasOcupacao / 30) * 100) : 0;
  const iptuWifiAguaLuz = inputs.iptuMensal + inputs.wifi + inputs.agua + inputs.luz;
  const prazoAnos = Math.round(inputs.prazoMeses / 12);
  const taxaMensal = (inputs.taxaJurosMensal * 100).toFixed(1).replace(".", ",");
  const okPct = results.temReceita && results.temBaseCapital;

  // Despesas — maior para menor; opcionais zeradas ficam de fora
  const despesas = [
    ...(results.parcelaFinanciamento > 0
      ? [{ label: `Parcela do financiamento (${prazoAnos} anos · ${taxaMensal}%)`, value: results.parcelaFinanciamento }]
      : []),
    { label: `Administração + Seguro (${Math.round(inputs.taxaAdminSeguro * 100)}%)`, value: results.adminSeguro },
    { label: "IPTU, WiFi, água e luz", value: iptuWifiAguaLuz },
    { label: "Condomínio estimado", value: inputs.condominio },
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
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: Q.bg });
      const link = document.createElement("a");
      link.download = `rentabilidade-${nomeEmpreendimento || "vitacon"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Erro ao exportar:", e);
    } finally {
      setExporting(false);
    }
  };

  const Linha = ({ label, value, valueColor, strong = false }: { label: string; value: string; valueColor?: string; strong?: boolean }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
      padding: "14px 20px", borderBottom: `1px solid ${Q.hairline}`,
    }}>
      <span style={{ color: strong ? Q.branco : Q.cinza, fontSize: 14, fontWeight: strong ? 500 : 400, fontFamily: Q.fontSans }}>{label}</span>
      <span style={{ color: valueColor ?? Q.branco, fontSize: 14, fontWeight: 500, fontFamily: Q.fontSans, whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );

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

      {/* Peça exportável — brochure ON Paulista */}
      <div ref={cardRef} style={{ background: Q.bg, borderRadius: 16, padding: "28px 26px 20px", minWidth: 340, fontFamily: Q.fontSans }}>

        {/* HEADER — logo + traço azul + label mono */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 22, width: "auto", display: "block" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <div style={{ width: 34, height: 2, background: Q.azul }} />
              <span style={{ color: Q.azulTexto, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: Q.fontMono }}>
                Simulação de Rentabilidade
              </span>
            </div>
          </div>
          {nomeEmpreendimento && (
            <span style={{ color: Q.cinzaEscuro, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: Q.fontMono, paddingTop: 4 }}>
              {nomeEmpreendimento}
            </span>
          )}
        </div>

        {/* TOTAL INVESTIDO — banda grafite */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
          background: Q.banda, padding: "18px 20px", marginBottom: 2,
        }}>
          <span style={{ color: Q.branco, fontSize: 16, fontWeight: 500, fontFamily: Q.fontSans }}>Total investido</span>
          <span style={{ color: Q.azulTexto, fontSize: 24, fontWeight: 700, fontFamily: Q.fontDisplay, whiteSpace: "nowrap" }}>
            {fmtBRL(results.capitalProprioTotal)}
          </span>
        </div>

        {/* OCUPAÇÃO */}
        <Linha label="Diárias praticadas na região" value={fmtBRL(inputs.diaria)} />
        <Linha label="Ocupação" value={`${ocupacaoPct}% · ${inputs.diasOcupacao} dias`} />

        {/* RECEITA BRUTA — destaque com borda azul */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
          background: Q.azulBg, borderLeft: `3px solid ${Q.azul}`,
          padding: "15px 20px 15px 17px",
        }}>
          <span style={{ color: Q.branco, fontSize: 14, fontWeight: 500, fontFamily: Q.fontSans }}>Receita bruta mensal</span>
          <span style={{ color: Q.branco, fontSize: 14, fontWeight: 600, fontFamily: Q.fontSans, whiteSpace: "nowrap" }}>
            {fmtBRL(results.receitaBrutaMensal)}
          </span>
        </div>

        {/* DESPESAS — valores em azul com "−" */}
        {despesas.map((d) => (
          <Linha key={d.label} label={d.label} value={`− ${fmtBRL(d.value)}`} valueColor={Q.azulTexto} />
        ))}

        {/* RENDA MENSAL LÍQUIDA */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
          padding: "18px 20px",
        }}>
          <span style={{ color: Q.branco, fontSize: 16, fontWeight: 500, fontFamily: Q.fontSans }}>Renda mensal líquida</span>
          <span style={{ color: Q.azulTexto, fontSize: 22, fontWeight: 700, fontFamily: Q.fontDisplay, whiteSpace: "nowrap" }}>
            {fmtBRL(results.rendaMensalLiquida)}
          </span>
        </div>

        {/* RENDA ANUAL LÍQUIDA — faixa sólida azul */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
          background: Q.azul, padding: "18px 20px",
        }}>
          <span style={{ color: Q.branco, fontSize: 16, fontWeight: 500, fontFamily: Q.fontSans }}>Renda anual líquida</span>
          <span style={{ color: Q.branco, fontSize: 22, fontWeight: 700, fontFamily: Q.fontDisplay, whiteSpace: "nowrap" }}>
            {fmtBRL(results.rendaMensalLiquida * 12)}
          </span>
        </div>

        {/* RETORNOS */}
        <div style={{ marginTop: 2 }}>
          <Linha label="Retorno sobre investimento A.M" value={okPct ? fmtPct(results.ganhoFinanceiroMensal) : "—"} strong />
          <Linha label="Retorno sobre investimento A.A" value={okPct ? fmtPct(results.rentabilidadeAnual) : "—"} strong />
          <Linha label="Retorno sobre patrimônio A.M" value={okPct ? fmtPct(results.retornoPatrimonioMensal) : "—"} />
          <Linha label="Retorno sobre patrimônio A.A" value={okPct ? fmtPct(results.retornoPatrimonioAnual) : "—"} />
        </div>

        {/* RODAPÉ */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16 }}>
          <span style={{ color: Q.cinzaEscuro, fontSize: 10, letterSpacing: "0.2em", fontFamily: Q.fontMono }}>
            VALORIZE COM A CIDADE
          </span>
          <span style={{ color: Q.cinzaEscuro, fontSize: 10, fontFamily: Q.fontMono }}>
            {new Date().toLocaleDateString("pt-BR")}
          </span>
        </div>
      </div>
    </div>
  );
}
