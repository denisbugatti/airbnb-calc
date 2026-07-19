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
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { Download, ImagePlus, X as XIcon, FileText } from "lucide-react";
import { calcular, formatCurrency, defaultInputs, type CalculatorInputs, type CalculatorResults } from "@/lib/calculator";
import { useFluxo, calcularFluxo, type FluxoInputs, type FluxoResults } from "@/contexts/FluxoContext";
import { useCenarios } from "@/contexts/CenariosContext";
import { useVitaconColors } from "@/lib/vitaconColors";
import { PaginaInstitucional, PaginaEntregas, PaginaChatGPT } from "@/pdf/PaginasVitacon";
import { PaginaPaulistaAbertura, PaginaPaulistaSaude, PaginaPaulistaFluxo, PaginaPaulistaHospitais, PaginaTrafegoAereo, PaginaFreiCaneca, PaginaMackenzie, PaginaPacaembuArena, PaginaPacaembuComplexo, PaginaEspm, PaginaSirioBelaVista, PaginaOswaldoCruz, PaginaBP } from "@/pdf/PaginasPaulista";
import { PaginaFariaLimaAbertura, PaginaFariaLimaFluxo, PaginaSuperJK1, PaginaSuperJK2, PaginaItaimBibi, PaginaFariaLimaEmpresas, PaginaCidadeJardim, PaginaShopsFariaLima, PaginaOscarFreire, PaginaHospitalClinicas, PaginaAlbertEinstein, PaginaLink, PaginaInsper, PaginaReboucas, PaginaCjShopsJardins, PaginaSirioBrooklin, PaginaBerriniChucri, PaginaHelipontos } from "@/pdf/PaginasFariaLima";
import { PaginaIdhMoema, PaginaCongonhas } from "@/pdf/PaginasMoema";
import { PaginaAllianzAbertura, PaginaAllianzDemanda, PaginaAllianzProximidade, PaginaPucPerdizes, PaginaBelasArtes, PaginaPerdizesPolo, PaginaSpExpoAbertura, PaginaSpExpoNumeros, PaginaAfya, PaginaG4 } from "@/pdf/PaginasAllianz";
import { PaginaLinhaLaranja } from "@/pdf/PaginasMetro";

const AZUL = "#2800FF";
const CINZA = "#898A8E";

// ─── Geradores de demanda — o usuário escolhe quais entram no PDF ─────────────
const GERADORES: { id: string; titulo: string; el: React.ReactNode }[] = [
  // Avenida Paulista
  { id: "paulista-abertura", titulo: "Paulista — Abertura", el: <PaginaPaulistaAbertura /> },
  { id: "paulista-saude", titulo: "Paulista — Rede de saúde", el: <PaginaPaulistaSaude /> },
  { id: "paulista-fluxo", titulo: "Paulista — 1,5 milhão por dia", el: <PaginaPaulistaFluxo /> },
  { id: "paulista-hospitais", titulo: "Paulista — Cinturão hospitalar", el: <PaginaPaulistaHospitais /> },
  { id: "frei-caneca", titulo: "Centro de Convenções Frei Caneca", el: <PaginaFreiCaneca /> },
  // Faria Lima / Itaim Bibi
  { id: "faria-abertura", titulo: "Faria Lima — Abertura", el: <PaginaFariaLimaAbertura /> },
  { id: "faria-fluxo", titulo: "Faria Lima — 145 mil executivos", el: <PaginaFariaLimaFluxo /> },
  { id: "faria-itaim", titulo: "Faria Lima — Itaim Bibi", el: <PaginaItaimBibi /> },
  { id: "faria-super-jk-1", titulo: "Faria Lima — Super JK (foto 1)", el: <PaginaSuperJK1 /> },
  { id: "faria-super-jk-2", titulo: "Faria Lima — Super JK (foto 2)", el: <PaginaSuperJK2 /> },
  { id: "faria-cidade-jardim", titulo: "Faria Lima — CJ Shops (Cidade Jardim)", el: <PaginaCidadeJardim /> },
  { id: "faria-shops-torre", titulo: "Faria Lima — Shops Faria Lima (torre)", el: <PaginaShopsFariaLima /> },
  { id: "faria-empresas", titulo: "Faria Lima — Empresas na região", el: <PaginaFariaLimaEmpresas /> },
  { id: "faria-helipontos", titulo: "Faria Lima — mais helipontos que pontos de ônibus", el: <PaginaHelipontos /> },
  { id: "reboucas", titulo: "Avenida Rebouças (nova Faria Lima)", el: <PaginaReboucas /> },
  { id: "berrini-chucri", titulo: "Berrini × Chucri Zaidan", el: <PaginaBerriniChucri /> },
  // Perdizes / Allianz Parque
  { id: "allianz-abertura", titulo: "Allianz Parque — Abertura", el: <PaginaAllianzAbertura /> },
  { id: "allianz-demanda", titulo: "Allianz Parque — Demanda (+2,5 mi/ano)", el: <PaginaAllianzDemanda /> },
  { id: "allianz-proximidade", titulo: "Allianz Parque — 2 minutos a pé", el: <PaginaAllianzProximidade /> },
  { id: "puc-perdizes", titulo: "PUC-SP — Campus Perdizes", el: <PaginaPucPerdizes /> },
  { id: "perdizes-polo", titulo: "Perdizes — polo de educação, saúde e lazer", el: <PaginaPerdizesPolo /> },
  { id: "pacaembu-arena", titulo: "Pacaembu — 40 mil em noite de show", el: <PaginaPacaembuArena /> },
  { id: "pacaembu-complexo", titulo: "Pacaembu — complexo multiuso", el: <PaginaPacaembuComplexo /> },
  { id: "linha-laranja", titulo: "Metrô — Linha 6-Laranja (universidades)", el: <PaginaLinhaLaranja /> },
  // Vila Mariana
  { id: "belas-artes", titulo: "Belas Artes — Vila Mariana", el: <PaginaBelasArtes /> },
  { id: "mackenzie", titulo: "Mackenzie — hospedagem oficial", el: <PaginaMackenzie /> },
  { id: "espm", titulo: "ESPM — demanda de longa permanência", el: <PaginaEspm /> },
  // Moema / Congonhas
  { id: "idh-moema", titulo: "Moema — IDH 0,961", el: <PaginaIdhMoema /> },
  { id: "congonhas", titulo: "Congonhas — 1,9 milhão de passageiros/mês", el: <PaginaCongonhas /> },
  // Jardins
  { id: "oscar-freire", titulo: "Rua Oscar Freire", el: <PaginaOscarFreire /> },
  { id: "cj-shops-jardins", titulo: "CJ Shops Jardins (JHSF)", el: <PaginaCjShopsJardins /> },
  // Saúde
  { id: "hospital-clinicas", titulo: "Hospital das Clínicas", el: <PaginaHospitalClinicas /> },
  { id: "albert-einstein", titulo: "Albert Einstein — nova unidade", el: <PaginaAlbertEinstein /> },
  { id: "sirio-brooklin", titulo: "Sírio-Libanês — nova unidade (Brooklin)", el: <PaginaSirioBrooklin /> },
  { id: "sirio-bela-vista", titulo: "Sírio-Libanês — Bela Vista", el: <PaginaSirioBelaVista /> },
  { id: "oswaldo-cruz", titulo: "Hospital Alemão Oswaldo Cruz", el: <PaginaOswaldoCruz /> },
  { id: "bp-bela-vista", titulo: "BP — Beneficência Portuguesa", el: <PaginaBP /> },
  // Educação de elite
  { id: "link-school", titulo: "Link School (universidade dos bilionários)", el: <PaginaLink /> },
  { id: "insper", titulo: "Insper", el: <PaginaInsper /> },
  // São Paulo Expo
  { id: "sp-expo-abertura", titulo: "São Paulo Expo — Abertura", el: <PaginaSpExpoAbertura /> },
  { id: "sp-expo-numeros", titulo: "São Paulo Expo — Números", el: <PaginaSpExpoNumeros /> },
  // Parcerias — demanda embarcada
  { id: "afya", titulo: "Afya Educação Médica + Vitacon", el: <PaginaAfya /> },
  { id: "g4", titulo: "G4 Educação + Vitacon", el: <PaginaG4 /> },
  // Global
  { id: "trafego-aereo", titulo: "Maior tráfego aéreo do mundo", el: <PaginaTrafegoAereo /> },
];

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

// ─── Fotos do empreendimento por link ────────────────────────────────────────
// As imagens vêm de origens externas (site da Vitacon, Google Drive); o proxy
// /api/img-proxy as devolve same-origin — sem ele, o html-to-image contamina o
// canvas e a página sai em branco no PDF.
type FotoEmp = { id: string; url: string };
const CHAVE_FOTOS = "vitacon.pdf.fotosEmpreendimento";

const viaProxy = (url: string) => `/api/img-proxy?url=${encodeURIComponent(url)}`;

/** Converte links de compartilhamento do Google Drive no link direto do arquivo. */
function linkDiretoDrive(url: string): string {
  const m = url.match(/drive\.google\.com\/(?:file\/d\/([\w-]{10,})|open\?id=([\w-]{10,})|uc\?[^ ]*id=([\w-]{10,}))/);
  const id = m?.[1] ?? m?.[2] ?? m?.[3];
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
}

/**
 * Página de foto. Horizontal entra em tela cheia (`cover`); vertical fica
 * inteira em `contain` sobre ela mesma desfocada — cobrir 1920×1080 com um
 * retrato cortaria quase toda a imagem.
 */
function PaginaFoto({ src, alt }: { src: string; alt: string }) {
  const [horizontal, setHorizontal] = useState<boolean | null>(null);
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000" }}>
      {horizontal !== true && (
        <img src={src} alt="" aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(48px) brightness(0.45)", transform: "scale(1.12)" }} />
      )}
      <img src={src} alt={alt}
        onLoad={(e) => setHorizontal(e.currentTarget.naturalWidth > e.currentTarget.naturalHeight)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: horizontal === true ? "cover" : "contain" }} />
    </div>
  );
}

// ─── Página: abertura do empreendimento (foto vertical + comparativo) ────────
// Primeira página do bloco do prédio. Métricas fixas de marketing (valorização
// e ocupação médias Vitacon+Housi vs. mercado) + rentabilidade anual líquida
// puxada da simulação corrente — nunca um número digitado à mão.
const COMPARATIVO_EMP: { label: string; mercado: number; vitacon: number }[] = [
  { label: "Valorização média", mercado: 30, vitacon: 92 },
  { label: "Ocupação média", mercado: 58, vitacon: 78 },
];

function PaginaAberturaEmpreendimento({ dados, fotoSrc }: { dados: DadosPdf; fotoSrc: string }) {
  const rendaAnual = dados.results.rendaMensalLiquida * 12;
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", display: "flex", overflow: "hidden" }}>
      {/* Coluna de conteúdo */}
      <div style={{ flex: 1, padding: "88px 96px 88px 88px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 44, width: "auto", alignSelf: "flex-start" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 56 }}>
          <div style={{ width: 44, height: 3, background: AZUL }} />
          <span style={{ fontSize: 18, letterSpacing: "0.3em", textTransform: "uppercase", color: AZUL, fontFamily: "var(--font-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Projeto powered by Housi{dados.nomeEmpreendimento ? ` · ${dados.nomeEmpreendimento}` : ""}
          </span>
        </div>

        <h1 style={{ margin: "26px 0 0", fontSize: 72, fontWeight: 400, color: "#FFF", lineHeight: 1.14 }}>
          Valorização que excede<br />a expectativa
        </h1>

        {/* Cabeçalho das colunas */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 1fr", gap: "0 40px", marginTop: 64, alignItems: "baseline" }}>
          <span />
          <span style={{ fontSize: 17, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A9AA2", fontFamily: "var(--font-mono)" }}>Mercado</span>
          <span style={{ fontSize: 17, letterSpacing: "0.22em", textTransform: "uppercase", color: AZUL, fontFamily: "var(--font-mono)" }}>Vitacon · Housi</span>
        </div>
        {COMPARATIVO_EMP.map((c) => (
          <div key={c.label} style={{ display: "grid", gridTemplateColumns: "280px 1fr 1fr", gap: "0 40px", alignItems: "center", padding: "34px 0", borderTop: "1px solid #1F1F1F" }}>
            <span style={{ fontSize: 27, color: "#E6E6E6" }}>{c.label}</span>
            <div>
              <div style={{ fontSize: 44, fontWeight: 600, color: "#FFF" }}>{c.mercado}%</div>
              <div style={{ height: 8, background: "#242428", borderRadius: 4, marginTop: 14, overflow: "hidden" }}>
                <div style={{ width: `${c.mercado}%`, height: "100%", background: "#8A8A92", borderRadius: 4 }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 44, fontWeight: 700, color: AZUL }}>
                {c.vitacon}% <span style={{ color: "#3DDC84", fontSize: 30 }}>↗</span>
              </div>
              <div style={{ height: 8, background: "#242428", borderRadius: 4, marginTop: 14, overflow: "hidden" }}>
                <div style={{ width: `${c.vitacon}%`, height: "100%", background: AZUL, borderRadius: 4 }} />
              </div>
            </div>
          </div>
        ))}

        {/* Rentabilidade — sempre o valor vivo da simulação */}
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "32px 38px", background: AZUL }}>
          <span style={{ fontSize: 30, color: "#FFF", fontWeight: 600 }}>Rentabilidade anual líquida</span>
          <span style={{ fontSize: 46, color: "#FFF", fontWeight: 700, whiteSpace: "nowrap" }}>{formatCurrency(rendaAnual)}</span>
        </div>
      </div>

      {/* Foto vertical */}
      <div style={{ width: 800, flexShrink: 0 }}>
        <img src={fotoSrc} alt={`Empreendimento ${dados.nomeEmpreendimento || ""}`.trim()}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    </div>
  );
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
  const [geradoresAtivos, setGeradoresAtivos] = useState<string[]>(() => GERADORES.map((g) => g.id));
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const paginasRef = useRef<HTMLDivElement>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  // Galeria de fotos do empreendimento (por link), persistida entre sessões
  const [fotosEmp, setFotosEmp] = useState<FotoEmp[]>(() => {
    try { return JSON.parse(localStorage.getItem(CHAVE_FOTOS) ?? "[]"); } catch { return []; }
  });
  const [novoLink, setNovoLink] = useState("");
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const [testandoFoto, setTestandoFoto] = useState(false);
  // Galeria encontrada numa página (site/pasta do Drive), aguardando seleção
  const [galeria, setGaleria] = useState<string[] | null>(null);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  useEffect(() => { localStorage.setItem(CHAVE_FOTOS, JSON.stringify(fotosEmp)); }, [fotosEmp]);

  /** Testa o carregamento via proxy antes de aceitar — o erro aparece aqui, não no PDF. */
  const carregaViaProxy = (url: string) =>
    new Promise<void>((ok, falha) => {
      const im = new Image();
      im.onload = () => ok();
      im.onerror = () => falha(new Error());
      im.src = viaProxy(url);
    });

  const adicionarFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    const bruto = novoLink.trim();
    if (!bruto || testandoFoto) return;
    setErroFoto(null);
    let url: string;
    try { url = linkDiretoDrive(new URL(bruto).toString()); } catch { setErroFoto("Isso não parece um link válido."); return; }
    setTestandoFoto(true);
    try {
      // O servidor decide: link de imagem volta ela mesma; página/pasta volta tudo que achou
      const resp = await fetch(`/api/fotos-pagina?url=${encodeURIComponent(url)}`);
      const corpo = (await resp.json()) as { fotos?: string[]; erro?: string };
      if (!resp.ok || !corpo.fotos?.length) {
        setErroFoto(corpo.erro ?? "Não consegui buscar fotos nesse link.");
        return;
      }
      const novas = corpo.fotos.filter((u) => !fotosEmp.some((f) => f.url === u));
      if (novas.length === 0) { setErroFoto("Todas as fotos desse link já estão na lista."); return; }

      if (corpo.fotos.length === 1) {
        // Link direto de imagem: mantém o fluxo antigo, sem etapa de seleção
        await carregaViaProxy(novas[0]);
        setFotosEmp((prev) => [...prev, { id: crypto.randomUUID(), url: novas[0] }]);
        setNovoLink("");
      } else {
        // Abre com tudo marcado: o comum é querer a galeria inteira e
        // desmarcar duas ou três, não o contrário
        setGaleria(novas);
        setSelecionadas(new Set(novas));
      }
    } catch {
      setErroFoto("Não consegui carregar esse link. Confira se é público — no Drive, compartilhado como \"qualquer pessoa com o link\".");
    } finally {
      setTestandoFoto(false);
    }
  };

  const alternarSelecao = (url: string) =>
    setSelecionadas((prev) => {
      const prox = new Set(prev);
      if (prox.has(url)) prox.delete(url); else prox.add(url);
      return prox;
    });

  const adicionarSelecionadas = () => {
    if (!galeria) return;
    // Mantém a ordem em que aparecem na galeria, não a ordem dos cliques
    const escolhidas = galeria.filter((u) => selecionadas.has(u));
    setFotosEmp((prev) => [...prev, ...escolhidas.map((url) => ({ id: crypto.randomUUID(), url }))]);
    setGaleria(null);
    setSelecionadas(new Set());
    setNovoLink("");
  };

  const removerFoto = (id: string) => setFotosEmp((prev) => prev.filter((f) => f.id !== id));
  const moverFoto = (id: string, dir: -1 | 1) =>
    setFotosEmp((prev) => {
      const i = prev.findIndex((f) => f.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const prox = [...prev];
      [prox[i], prox[j]] = [prox[j], prox[i]];
      return prox;
    });

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
    // A aba do preview abre JÁ no clique: depois dos awaits o navegador perde o
    // gesto do usuário e o bloqueador de pop-up barraria o window.open.
    const abaPreview = window.open("", "_blank");
    if (abaPreview) {
      abaPreview.document.write(
        '<title>Gerando PDF…</title><body style="background:#000;color:#fff;font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0">Gerando o PDF…</body>',
      );
    }
    try {
      const nos = Array.from(raiz.querySelectorAll<HTMLElement>("[data-pdf-page]"));
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1920, 1080], compress: true });
      for (let i = 0; i < nos.length; i++) {
        const png = await toPng(nos[i], {
          pixelRatio: 1, backgroundColor: "#000000", width: 1920, height: 1080,
          // O nó do preview carrega scale(var(--pdf-scale)) para caber na tela;
          // sem anular no clone, o slide sai a ~36% num canto da página.
          style: { transform: "scale(1)" },
        });
        if (i > 0) pdf.addPage([1920, 1080], "landscape");
        pdf.addImage(png, "PNG", 0, 0, 1920, 1080);
      }
      const nomeArq = `vitacon-${(dados.nomeEmpreendimento || "apresentacao").replace(/[^\w.-]+/g, "-").toLowerCase()}.pdf`;
      const url = URL.createObjectURL(pdf.output("blob"));
      if (abaPreview) abaPreview.location.href = url;
      pdf.save(nomeArq);
    } catch (e) {
      abaPreview?.close();
      console.error("[pdf] falhou:", e);
      alert("Não foi possível gerar o PDF agora. Tente novamente.");
    } finally {
      setGerando(false);
    }
  };

  const toggleGerador = (id: string) =>
    setGeradoresAtivos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const moverGerador = (id: string, dir: -1 | 1) =>
    setGeradoresAtivos((prev) => {
      const i = prev.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const prox = [...prev];
      [prox[i], prox[j]] = [prox[j], prox[i]];
      return prox;
    });

  // Ações disponíveis no card do preview. Páginas fixas não trazem `acoes`.
  type PaginaDeck = {
    titulo: string; el: React.ReactNode;
    acoes?: { excluir: () => void; mover: (dir: -1 | 1) => void; primeira: boolean; ultima: boolean };
  };

  // A ordem segue geradoresAtivos (reordenável no preview); "Todos" restaura a
  // ordem canônica do catálogo.
  const paginasGeradores: PaginaDeck[] = geradoresAtivos
    .map((id) => GERADORES.find((g) => g.id === id))
    .filter((g): g is (typeof GERADORES)[number] => Boolean(g))
    .map((g, i, lista) => ({
      titulo: g.titulo, el: g.el,
      acoes: { excluir: () => toggleGerador(g.id), mover: (dir) => moverGerador(g.id, dir), primeira: i === 0, ultima: i === lista.length - 1 },
    }));

  const paginasFotosEmp: PaginaDeck[] = fotosEmp.map((f, i) => ({
    titulo: `Foto do empreendimento ${String(i + 1).padStart(2, "0")}`,
    el: <PaginaFoto src={viaProxy(f.url)} alt={`Foto ${i + 1} do empreendimento ${dados.nomeEmpreendimento || ""}`.trim()} />,
    acoes: { excluir: () => removerFoto(f.id), mover: (dir: -1 | 1) => moverFoto(f.id, dir), primeira: i === 0, ultima: i === fotosEmp.length - 1 },
  }));

  const paginas: PaginaDeck[] = [
    { titulo: "Capa", el: <PaginaFixa src="/pdf-assets/capa-01.png" alt="Capa Vitacon" /> },
    { titulo: "Valorize com a cidade", el: <PaginaFixa src="/pdf-assets/valorize-cidade.jpg" alt="Valorize com a cidade" /> },
    ...paginasGeradores,
    { titulo: "Vitacon — Institucional", el: <PaginaInstitucional /> },
    { titulo: "Últimas entregas", el: <PaginaEntregas /> },
    { titulo: "Até o ChatGPT sabe", el: <PaginaChatGPT /> },
    { titulo: "A primeira Fincorporadora do mundo", el: <PaginaFixa src="/pdf-assets/fincorporadora.jpg" alt="A primeira Fincorporadora do mundo" /> },
    // Bloco do empreendimento, fechando em Plano de Pagamento: abertura com a
    // foto vertical (upload local; sem ela, a 1ª da galeria) → galeria → fluxo.
    ...(fotoUrl || fotosEmp.length > 0
      ? [{ titulo: "Abertura do empreendimento", el: <PaginaAberturaEmpreendimento dados={dados} fotoSrc={fotoUrl ?? viaProxy(fotosEmp[0].url)} /> }]
      : []),
    ...paginasFotosEmp,
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
            Monte o material oficial com o Plano de Pagamento e a Simulação de Rentabilidade — dos dados abertos agora ou de um cenário salvo. Escolha quais geradores de demanda entram no PDF e adicione a foto do empreendimento.
          </p>
        </motion.div>

        {/* Geradores de demanda — seleção individual */}
        <div className="rounded-2xl p-4 mb-3" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.25em]" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>Geradores de demanda</div>
            <div className="flex items-center gap-3">
              <span className="text-[10px]" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>
                {geradoresAtivos.length} de {GERADORES.length}
              </span>
              <button
                onClick={() => setGeradoresAtivos(geradoresAtivos.length === GERADORES.length ? [] : GERADORES.map((g) => g.id))}
                className="press text-[10px] uppercase tracking-[0.2em] font-bold"
                style={{ color: colors.blue, fontFamily: "var(--font-mono)" }}
              >
                {geradoresAtivos.length === GERADORES.length ? "Limpar" : "Todos"}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {GERADORES.map((g) => {
              const on = geradoresAtivos.includes(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => toggleGerador(g.id)}
                  className="press flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold"
                  style={{ background: on ? colors.blue : colors.inputBg, border: `1px solid ${on ? colors.blue : colors.border}`, color: on ? "#FFFFFF" : colors.text3 }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: on ? "#FFFFFF" : colors.text4 }} />
                  {g.titulo}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controles */}
        <div className="grid md:grid-cols-3 gap-3 mb-8">
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

        {/* Fotos do empreendimento por link */}
        <div className="rounded-2xl p-4 mb-8" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.25em]" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>
              Fotos do empreendimento
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px]" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>
                {fotosEmp.length} {fotosEmp.length === 1 ? "foto" : "fotos"}
              </span>
              {fotosEmp.length > 0 && (
                <button
                  onClick={() => setFotosEmp([])}
                  className="press text-[10px] uppercase tracking-[0.2em] font-bold"
                  style={{ color: colors.red, fontFamily: "var(--font-mono)" }}
                >
                  Limpar tudo
                </button>
              )}
            </div>
          </div>
          <form onSubmit={adicionarFoto} className="flex gap-2">
            <input
              type="url"
              value={novoLink}
              onChange={(e) => { setNovoLink(e.target.value); setErroFoto(null); }}
              placeholder="Cole um link: página do empreendimento no site da Vitacon, pasta do Google Drive ou imagem"
              className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.text1 }}
            />
            <button
              type="submit"
              disabled={testandoFoto || !novoLink.trim()}
              className="press flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              style={{ background: colors.blue, color: "#FFFFFF", opacity: testandoFoto || !novoLink.trim() ? 0.6 : 1 }}
            >
              <ImagePlus size={14} />
              {testandoFoto ? "Buscando…" : "Buscar fotos"}
            </button>
          </form>
          {erroFoto && (
            <p className="text-xs mt-2" style={{ color: colors.red }}>{erroFoto}</p>
          )}

          {/* Galeria encontrada — escolha antes de entrar na lista */}
          {galeria && (
            <div className="mt-4 rounded-xl p-3" style={{ background: colors.inputBg, border: `1px solid ${colors.blue}` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: colors.text3, fontFamily: "var(--font-mono)" }}>
                  {galeria.length} fotos encontradas · {selecionadas.size} selecionadas
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelecionadas(selecionadas.size === galeria.length ? new Set() : new Set(galeria))}
                    className="press text-[10px] uppercase tracking-[0.2em] font-bold"
                    style={{ color: colors.blue, fontFamily: "var(--font-mono)" }}
                  >
                    {selecionadas.size === galeria.length ? "Desmarcar todas" : "Marcar todas"}
                  </button>
                  <button
                    onClick={() => { setGaleria(null); setSelecionadas(new Set()); }}
                    className="press text-[10px] uppercase tracking-[0.2em] font-bold"
                    style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2" style={{ maxHeight: 340, overflowY: "auto" }}>
                {galeria.map((u, i) => {
                  const on = selecionadas.has(u);
                  return (
                    <button
                      key={u}
                      onClick={() => alternarSelecao(u)}
                      className="press relative rounded-lg overflow-hidden"
                      style={{ border: `2px solid ${on ? colors.blue : colors.border}`, opacity: on ? 1 : 0.75 }}
                      title={`Foto ${i + 1}`}
                    >
                      {/* Miniatura via proxy; entradas que não são imagem somem sozinhas */}
                      <img src={viaProxy(u)} alt="" loading="lazy" className="h-20 w-32 object-cover block"
                        onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
                      {on && (
                        <span className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
                          style={{ background: colors.blue, color: "#FFF" }}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={adicionarSelecionadas}
                disabled={selecionadas.size === 0}
                className="press w-full mt-3 rounded-xl px-4 py-2.5 text-sm font-bold"
                style={{ background: colors.blue, color: "#FFF", opacity: selecionadas.size === 0 ? 0.5 : 1 }}
              >
                Adicionar {selecionadas.size > 0 ? `${selecionadas.size} ` : ""}ao PDF
              </button>
            </div>
          )}

          {fotosEmp.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {fotosEmp.map((f, i) => (
                <div key={f.id} className="relative rounded-lg overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
                  <img src={viaProxy(f.url)} alt={`Foto ${i + 1}`} className="h-24 w-40 object-cover block" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1.5 py-1" style={{ background: "rgba(0,0,0,0.62)" }}>
                    <span className="text-[10px] font-bold" style={{ color: "#FFF", fontFamily: "var(--font-mono)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => moverFoto(f.id, -1)} disabled={i === 0} className="press text-xs px-1" style={{ color: "#FFF", opacity: i === 0 ? 0.3 : 1 }} title="Mover para a esquerda">←</button>
                      <button onClick={() => moverFoto(f.id, 1)} disabled={i === fotosEmp.length - 1} className="press text-xs px-1" style={{ color: "#FFF", opacity: i === fotosEmp.length - 1 ? 0.3 : 1 }} title="Mover para a direita">→</button>
                      <button onClick={() => removerFoto(f.id)} className="press text-xs px-1" style={{ color: colors.red }} title="Remover foto">✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                {p.acoes && (
                  <span className="ml-auto flex items-center gap-1">
                    <button onClick={() => p.acoes!.mover(-1)} disabled={p.acoes.primeira}
                      className="press px-1.5 text-xs" title="Mover para cima"
                      style={{ color: colors.text3, opacity: p.acoes.primeira ? 0.25 : 1 }}>↑</button>
                    <button onClick={() => p.acoes!.mover(1)} disabled={p.acoes.ultima}
                      className="press px-1.5 text-xs" title="Mover para baixo"
                      style={{ color: colors.text3, opacity: p.acoes.ultima ? 0.25 : 1 }}>↓</button>
                    <button onClick={p.acoes.excluir} className="press px-1.5 text-xs" title="Excluir esta página do PDF"
                      style={{ color: colors.red }}>✕</button>
                  </span>
                )}
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
