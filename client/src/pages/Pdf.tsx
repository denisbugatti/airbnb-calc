/**
 * Pdf.tsx — Gerador de PDF Vitacon (aba PDF).
 * v1: monta o material com capa fixa + Plano de Pagamento + Simulação de
 * Rentabilidade (dos dados atuais ou de um cenário salvo) + páginas fixas de
 * cadastro e encerramento, no formato 1920×1080 idêntico ao brochure ON Paulista.
 *
 * Cada página é um nó DOM de 1920×1080 rasterizado com html-to-image e montado
 * num PDF paisagem via jsPDF. As páginas de região/geradores/fotos entram nas
 * próximas versões, uma a uma.
 */
import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { Download, ImagePlus, X as XIcon, FileText } from "lucide-react";
import { calcular, formatCurrency, defaultInputs, type CalculatorInputs, type CalculatorResults } from "@/lib/calculator";
import { useFluxo, calcularFluxo, type FluxoInputs, type FluxoResults } from "@/contexts/FluxoContext";
import { useCenarios } from "@/contexts/CenariosContext";
import { useVitaconColors } from "@/lib/vitaconColors";
import { PaginaInstitucional, PaginaEntregas, PaginaChatGPT, PaginaValorizacao } from "@/pdf/PaginasVitacon";
import { PaginaPaulistaAbertura, PaginaPaulistaSaude, PaginaPaulistaFluxo, PaginaPaulistaHospitais } from "@/pdf/PaginasPaulista";

const AZUL = "#2800FF";
const CINZA = "#898A8E";

// ─── Dados consolidados para as páginas dinâmicas ────────────────────────────
interface DadosPdf {
  calc: CalculatorInputs;
  fluxo: FluxoInputs;
  fluxoResults: FluxoResults;
  results: CalculatorResults;
  nomeEmpreendimento: string;
}

// ─── Cabeçalho padrão das páginas dinâmicas ──────────────────────────────────
function HeaderPagina({ rotulo, nome }: { rotulo: string; nome: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto", display: "block" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
          <div style={{ width: 44, height: 3, background: AZUL }} />
          <span style={{ fontSize: 20, letterSpacing: "0.3em", textTransform: "uppercase", color: AZUL, fontFamily: "var(--font-mono)" }}>
            {rotulo}
          </span>
        </div>
      </div>
      {nome && (
        <span style={{ fontSize: 18, letterSpacing: "0.3em", textTransform: "uppercase", color: CINZA, fontFamily: "var(--font-mono)", paddingTop: 8 }}>
          {nome}
        </span>
      )}
    </div>
  );
}

// ─── Página: imagem fixa (capa / cadastro / final) ───────────────────────────
function PaginaFixa({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} style={{ width: 1920, height: 1080, display: "block", objectFit: "cover" }} />;
}

// ─── Página: Plano de Pagamento ──────────────────────────────────────────────
function PaginaPlano({ dados }: { dados: DadosPdf }) {
  const { calc, fluxo, fluxoResults: r } = dados;
  const vi = calc.valorImovel;
  const pctDe = (v: number) => (vi > 0 ? `${((v / vi) * 100).toFixed(0)}%` : "");
  const totalSeries = r.totalInvestido + calc.mobilia;
  const pctInvestido = vi > 0 ? (totalSeries / vi) * 100 : 0;
  const semestrais = fluxo.semestrais ?? [];

  const series: { label: string; pct: string; value: number; total: number; solid?: boolean }[] = [
    ...(r.totalAto > 0 ? [{ label: `Ato ${fluxo.parcelasAto}×`, pct: pctDe(r.totalAto), value: fluxo.parcelasAto > 1 ? Math.round(r.totalAto / fluxo.parcelasAto) : r.totalAto, total: r.totalAto }] : []),
    ...(r.totalMensais > 0 ? [{ label: `Mensais ${fluxo.numMensais}×`, pct: pctDe(r.totalMensais), value: fluxo.numMensais > 1 ? fluxo.valorMensal : r.totalMensais, total: r.totalMensais }] : []),
    ...(r.totalSemestrais > 0 ? [{ label: `Semestrais ${semestrais.length}×`, pct: pctDe(r.totalSemestrais), value: semestrais.length > 1 ? (semestrais[0]?.valor ?? 0) : r.totalSemestrais, total: r.totalSemestrais }] : []),
    ...(r.totalAnuais > 0 ? [{ label: `Anuais ${fluxo.anuais.length}×`, pct: pctDe(r.totalAnuais), value: fluxo.anuais.length > 1 ? (fluxo.anuais[0]?.valor ?? 0) : r.totalAnuais, total: r.totalAnuais }] : []),
    ...(fluxo.extras ?? []).filter((e) => e.valor * e.parcelas > 0).map((e) => ({
      label: e.parcelas > 1 ? `${e.tipo} ${e.parcelas}×` : e.tipo,
      pct: pctDe(e.valor * e.parcelas), value: e.parcelas > 1 ? e.valor : e.valor * e.parcelas, total: e.valor * e.parcelas,
    })),
    ...(calc.mobilia > 0 ? [{ label: "Decoração", pct: pctDe(calc.mobilia), value: calc.mobilia, total: calc.mobilia }] : []),
  ];
  const resumo = [
    { label: "Total Investido", pct: vi > 0 ? `${pctInvestido.toFixed(0)}%` : "", value: totalSeries, total: totalSeries, solid: true },
    ...(fluxo.financiamentoExcluido ? [] : [{ label: "Financiamento", pct: pctDe(r.financiamento), value: r.financiamento, total: r.financiamento }]),
    { label: "Valor do Imóvel", pct: "", value: vi, total: vi },
  ];
  const cartoes = series.length === 1 && Math.abs(series[0].total - totalSeries) < 1
    ? [{ ...series[0], value: series[0].total, solid: true }, ...resumo.slice(1)]
    : [...series, ...resumo];

  return (
    <div style={{ width: 1920, height: 1080, background: "#000000", padding: "72px 88px", display: "flex", flexDirection: "column", fontFamily: "var(--font-sans)" }}>
      <HeaderPagina rotulo="Plano de Pagamento" nome={dados.nomeEmpreendimento} />
      <p style={{ margin: "84px 0 64px", fontSize: 64, fontWeight: 400, color: "#FFFFFF", lineHeight: 1.12 }}>
        {fluxo.financiamentoExcluido
          ? "Pagamento à vista, sem financiamento."
          : `Entrada de ${pctInvestido.toFixed(0)}%, o resto financiado.`}
      </p>
      {(() => {
        // Tipografia adaptativa: com muitas séries os cartões estreitam,
        // então rótulo e valores reduzem para nada ser cortado.
        const n = cartoes.length;
        const fLabel = n >= 7 ? 15 : n >= 5 ? 17 : 19;
        const fPct = n >= 7 ? 30 : n >= 5 ? 34 : 40;
        const fValor = n >= 7 ? 32 : n >= 5 ? 38 : 46;
        const pad = n >= 7 ? "36px 26px" : "44px 40px";
        return (
          <div style={{ display: "flex", gap: 2, background: "#242424", border: "1px solid #242424" }}>
            {cartoes.map((c) => (
              <div key={c.label} style={{ flex: "1 1 0", background: c.solid ? AZUL : "#0A0A0A", padding: pad, minWidth: 0 }}>
                <div style={{ fontSize: fLabel, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 24, color: c.solid ? "rgba(255,255,255,0.75)" : CINZA, fontFamily: "var(--font-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.label}
                </div>
                <div style={{ fontSize: fPct, fontWeight: 300, color: c.solid ? "rgba(255,255,255,0.85)" : "#B3B3B3", minHeight: "1.2em" }}>
                  {c.pct}
                </div>
                <div style={{ fontSize: fValor, fontWeight: 400, color: "#FFFFFF", letterSpacing: "-0.01em", marginTop: 8, whiteSpace: "nowrap" }}>
                  {formatCurrency(c.value)}
                </div>
              </div>
            ))}
          </div>
        );
      })()}
      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 17, letterSpacing: "0.25em", textTransform: "uppercase", color: "#5C5C5C", fontFamily: "var(--font-mono)" }}>
          Valores de referência · Sujeito a alteração
        </span>
        <span style={{ color: AZUL, fontSize: 34, fontWeight: 700 }}>↗</span>
      </div>
    </div>
  );
}

// ─── Página: Simulação de Rentabilidade ──────────────────────────────────────
function PaginaRentabilidade({ dados, fotoUrl }: { dados: DadosPdf; fotoUrl: string | null }) {
  const { results: res, calc } = dados;
  const totalInvestido = dados.fluxoResults.totalInvestido + calc.mobilia;
  const linhas: { label: string; valor: string; negativo?: boolean; destaque?: boolean }[] = [
    { label: "Diária média", valor: formatCurrency(calc.diaria) },
    { label: "Ocupação", valor: `${Math.round((calc.diasOcupacao / 30) * 100)}% · ${calc.diasOcupacao} dias` },
    { label: "Receita bruta mensal", valor: formatCurrency(res.receitaBrutaMensal), destaque: true },
    ...(res.parcelaFinanciamento > 0 ? [{ label: `Parcela do financiamento (${Math.round(calc.prazoMeses / 12)} anos · ${(calc.taxaJurosMensal * 100).toFixed(1).replace(".", ",")}%)`, valor: `− ${formatCurrency(res.parcelaFinanciamento)}`, negativo: true }] : []),
    { label: `Administração + Seguro (${Math.round(calc.taxaAdminSeguro * 100)}%)`, valor: `− ${formatCurrency(res.adminSeguro)}`, negativo: true },
    { label: "IPTU, WiFi, água e luz", valor: `− ${formatCurrency(calc.iptuMensal + calc.wifi + calc.agua + calc.luz)}`, negativo: true },
    { label: "Condomínio estimado", valor: `− ${formatCurrency(calc.condominio)}`, negativo: true },
  ];

  return (
    <div style={{ width: 1920, height: 1080, background: "#000000", padding: "72px 88px", fontFamily: "var(--font-sans)", display: "flex", flexDirection: "column" }}>
      <HeaderPagina rotulo="Simulação de Rentabilidade" nome={dados.nomeEmpreendimento} />
      <div style={{ display: "flex", gap: 72, marginTop: 56, flex: 1, minHeight: 0 }}>
        {/* Extrato */}
        <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#141414", border: "1px solid #2A2A2A", padding: "30px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 30, color: "#FFFFFF" }}>Total investido</span>
            <span style={{ fontSize: 42, color: AZUL, fontWeight: 600 }}>{formatCurrency(totalInvestido)}</span>
          </div>
          {linhas.map((l) => (
            <div key={l.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "22px 36px",
              borderBottom: "1px solid #1F1F1F",
              background: l.destaque ? "rgba(40,0,255,0.10)" : "transparent",
              borderLeft: l.destaque ? `5px solid ${AZUL}` : "5px solid transparent",
            }}>
              <span style={{ fontSize: 26, color: "#E6E6E6" }}>{l.label}</span>
              <span style={{ fontSize: 26, color: l.negativo ? AZUL : "#FFFFFF", fontWeight: 500 }}>{l.valor}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "26px 36px" }}>
            <span style={{ fontSize: 30, color: "#FFFFFF" }}>Renda mensal líquida</span>
            <span style={{ fontSize: 40, color: AZUL, fontWeight: 600 }}>{formatCurrency(res.rendaMensalLiquida)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "30px 36px", background: AZUL }}>
            <span style={{ fontSize: 32, color: "#FFFFFF", fontWeight: 600 }}>Renda anual líquida</span>
            <span style={{ fontSize: 44, color: "#FFFFFF", fontWeight: 700 }}>{formatCurrency(res.rendaMensalLiquida * 12)}</span>
          </div>
        </div>
        {/* Foto vertical do empreendimento */}
        {fotoUrl && (
          <div style={{ width: 560, flexShrink: 0 }}>
            <img src={fotoUrl} alt="Empreendimento" style={{ width: 560, height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 28 }}>
        <span style={{ color: AZUL, fontSize: 34, fontWeight: 700 }}>↗</span>
      </div>
    </div>
  );
}

// ─── Página do gerador ───────────────────────────────────────────────────────
export default function PdfPage() {
  const colors = useVitaconColors(true);
  const { calc, fluxo, results, nomeEmpreendimento, setNomeEmpreendimento } = useFluxo();
  const { cenarios } = useCenarios();

  const [fonte, setFonte] = useState<string>("atual"); // "atual" | id do cenário
  const [regiao, setRegiao] = useState<string>("paulista"); // "paulista" | "nenhuma"
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const paginasRef = useRef<HTMLDivElement>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  // Consolida os dados da fonte escolhida
  const dados: DadosPdf = useMemo(() => {
    if (fonte !== "atual") {
      const c = cenarios.find((x) => x.id === fonte);
      if (c) {
        const calcC = { ...defaultInputs, ...c.inputs };
        const fluxoC = c.fluxo ?? fluxo;
        const fr = calcularFluxo(fluxoC, calcC.valorImovel);
        const inputsComFluxo = { ...calcC, capitalProprio: fr.totalInvestido, saldoFinanciar: fr.financiamento };
        return {
          calc: inputsComFluxo,
          fluxo: fluxoC,
          fluxoResults: fr,
          results: calcular(inputsComFluxo),
          nomeEmpreendimento: c.nomeEmpreendimento ?? nomeEmpreendimento,
        };
      }
    }
    const inputsComFluxo = { ...calc, capitalProprio: results.totalInvestido, saldoFinanciar: results.financiamento };
    return { calc: inputsComFluxo, fluxo, fluxoResults: results, results: calcular(inputsComFluxo), nomeEmpreendimento };
  }, [fonte, cenarios, calc, fluxo, results, nomeEmpreendimento]);

  const escolherFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (fotoUrl) URL.revokeObjectURL(fotoUrl);
    setFotoUrl(URL.createObjectURL(f));
  };

  const gerarPdf = async () => {
    const raiz = paginasRef.current;
    if (!raiz || gerando) return;
    setGerando(true);
    try {
      const nos = Array.from(raiz.querySelectorAll<HTMLElement>("[data-pdf-page]"));
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1920, 1080], compress: true });
      for (let i = 0; i < nos.length; i++) {
        const png = await toPng(nos[i], { pixelRatio: 1, backgroundColor: "#000000", width: 1920, height: 1080 });
        if (i > 0) pdf.addPage([1920, 1080], "landscape");
        pdf.addImage(png, "PNG", 0, 0, 1920, 1080);
      }
      const nomeArq = `vitacon-${(dados.nomeEmpreendimento || "apresentacao").replace(/[^\w.-]+/g, "-").toLowerCase()}.pdf`;
      pdf.save(nomeArq);
    } catch (e) {
      console.error("[pdf] falhou:", e);
      alert("Não foi possível gerar o PDF agora. Tente novamente.");
    } finally {
      setGerando(false);
    }
  };

  const paginasRegiao: { titulo: string; el: React.ReactNode }[] = regiao === "paulista" ? [
    { titulo: "Região — Avenida Paulista", el: <PaginaPaulistaAbertura /> },
    { titulo: "Região — Rede de saúde", el: <PaginaPaulistaSaude /> },
    { titulo: "Região — 1,5 milhão por dia", el: <PaginaPaulistaFluxo /> },
    { titulo: "Região — Cinturão hospitalar", el: <PaginaPaulistaHospitais /> },
  ] : [];

  const paginas: { titulo: string; el: React.ReactNode }[] = [
    { titulo: "Capa", el: <PaginaFixa src="/pdf-assets/capa-01.png" alt="Capa Vitacon" /> },
    ...paginasRegiao,
    { titulo: "Vitacon — Institucional", el: <PaginaInstitucional /> },
    { titulo: "Últimas entregas", el: <PaginaEntregas /> },
    { titulo: "Até o ChatGPT sabe", el: <PaginaChatGPT /> },
    { titulo: "Valorização média 92%", el: <PaginaValorizacao /> },
    { titulo: "Plano de Pagamento", el: <PaginaPlano dados={dados} /> },
    { titulo: "Simulação de Rentabilidade", el: <PaginaRentabilidade dados={dados} fotoUrl={fotoUrl} /> },
    { titulo: "Cadastro exclusivo", el: <PaginaFixa src="/pdf-assets/fim-62.png" alt="Cadastro exclusivo" /> },
    { titulo: "Encerramento", el: <PaginaFixa src="/pdf-assets/fim-63.png" alt="Encerramento" /> },
  ];

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header brochure */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }} className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px]" style={{ background: colors.blue }} />
            <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>
              Gerador de apresentação
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase leading-none" style={{ color: colors.text1, fontFamily: "var(--font-display)", letterSpacing: "0.01em" }}>
            PDF
          </h1>
          <p className="text-xs mt-2 max-w-xl" style={{ color: colors.text4 }}>
            Monte o material oficial com o Plano de Pagamento e a Simulação de Rentabilidade — dos dados abertos agora ou de um cenário salvo. Páginas de região, geradores de demanda e fotos do empreendimento entram em breve.
          </p>
        </motion.div>

        {/* Controles */}
        <div className="grid md:grid-cols-4 gap-3 mb-8">
          <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>Região</div>
            <select
              value={regiao}
              onChange={(e) => setRegiao(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold outline-none"
              style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.text1 }}
            >
              <option value="paulista">Avenida Paulista</option>
              <option value="nenhuma">Sem páginas de região</option>
            </select>
          </div>
          <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>Fonte dos dados</div>
            <select
              value={fonte}
              onChange={(e) => setFonte(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold outline-none"
              style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.text1 }}
            >
              <option value="atual">Dados atuais (Fluxo + Calculadora)</option>
              {cenarios.map((c) => (
                <option key={c.id} value={c.id}>Cenário: {c.nome}</option>
              ))}
            </select>
          </div>
          <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>Nome do empreendimento</div>
            <input
              type="text"
              value={nomeEmpreendimento}
              onChange={(e) => setNomeEmpreendimento(e.target.value)}
              placeholder="ON PAULISTA"
              className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold outline-none"
              style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.text1 }}
            />
          </div>
          <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>Foto vertical do prédio</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fotoInputRef.current?.click()}
                className="press flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold"
                style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.text2 }}
              >
                <ImagePlus size={14} style={{ color: colors.blue }} />
                {fotoUrl ? "Trocar foto" : "Subir foto"}
              </button>
              {fotoUrl && (
                <button onClick={() => { URL.revokeObjectURL(fotoUrl); setFotoUrl(null); }}
                  className="press w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: colors.redBg, border: `1px solid ${colors.redBorder}`, color: colors.red }} title="Remover foto">
                  <XIcon size={14} />
                </button>
              )}
            </div>
            <input ref={fotoInputRef} type="file" accept="image/*" onChange={escolherFoto} className="hidden" />
          </div>
        </div>

        {/* Botão gerar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>
            {paginas.length} páginas · 1920×1080
          </span>
          <button
            onClick={gerarPdf}
            disabled={gerando}
            className="press flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold uppercase tracking-wider"
            style={{ background: colors.blue, color: "#FFFFFF", fontFamily: "var(--font-display)", opacity: gerando ? 0.7 : 1 }}
          >
            {gerando ? <FileText size={15} /> : <Download size={15} />}
            {gerando ? "Gerando PDF..." : "Gerar PDF"}
          </button>
        </div>

        {/* Preview das páginas (1920×1080 escalado) */}
        <div ref={paginasRef} className="space-y-6">
          {paginas.map((p, i) => (
            <div key={p.titulo}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold" style={{ color: colors.blue, fontFamily: "var(--font-mono)" }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>{p.titulo}</span>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
                {/* container mantém o aspect ratio; o conteúdo 1920×1080 é escalado para caber */}
                <div style={{ width: "100%", aspectRatio: "16 / 9", position: "relative", background: "#000" }}>
                  <div data-pdf-page style={{ position: "absolute", top: 0, left: 0, width: 1920, height: 1080, transform: "scale(var(--pdf-scale, 0.5))", transformOrigin: "top left" }}
                    ref={(el) => {
                      if (el && el.parentElement) {
                        const pai = el.parentElement;
                        const aplicar = () => {
                          const w = pai.clientWidth;
                          if (w > 0) el.style.setProperty("--pdf-scale", String(w / 1920));
                        };
                        aplicar();
                        // Recalcula sempre que o container mudar (evita escala 0 se medir escondido)
                        if (!el.dataset.obs) {
                          el.dataset.obs = "1";
                          new ResizeObserver(aplicar).observe(pai);
                        }
                      }
                    }}>
                    {p.el}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
