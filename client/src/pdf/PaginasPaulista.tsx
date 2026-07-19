/**
 * PaginasPaulista.tsx — geradores de demanda da região AVENIDA PAULISTA.
 * Formato 1920×1080 · identidade Vitacon (preto #000 · azul #2800FF · branco).
 *
 * 1. Abertura       — foto aérea + "Avenida Paulista." + 3 métricas da região
 * 2. Times Square   — foto neon HD + manchete dos painéis de LED
 * 3. 1,5 milhão/dia — card real da busca Google + statement
 * 4. Cinturão       — +26 hospitais em raios de 500 m / 1 km / 2 km (logo Vitacon)
 */

const AZUL = "#2800FF";
const CINZA = "#898A8E";

// Sobre foto clara, o azul #2800FF não tem contraste: `corTexto` mantém a barra
// azul como acento e sobe o texto para branco.
function Kicker({ children, cor = AZUL, corTexto }: { children: React.ReactNode; cor?: string; corTexto?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 44, height: 3, background: cor }} />
      <span style={{ fontSize: 19, letterSpacing: "0.3em", textTransform: "uppercase", color: corTexto ?? cor, fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
        {children}
      </span>
    </div>
  );
}

// ─── 1. Abertura — Avenida Paulista ──────────────────────────────────────────
export function PaginaPaulistaAbertura() {
  const stats = [
    { numero: "1,5 mi", sub: "Pessoas por dia" },
    { numero: "+26", sub: "Hospitais no cinturão" },
    { numero: "18", sub: "Universidades" },
  ];
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000", fontFamily: "var(--font-sans)" }}>
      <img src="/pdf-assets/paulista-aerea.jpg" alt="Avenida Paulista à noite"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* Gradientes de legibilidade */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.15) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0) 38%)" }} />

      <div style={{ position: "absolute", top: 64, left: 88, right: 88, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto" }} />
        <span style={{ fontSize: 18, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-mono)" }}>
          Região · São Paulo
        </span>
      </div>

      <div style={{ position: "absolute", left: 88, top: 380, maxWidth: 1100 }}>
        <Kicker>Geradores de demanda</Kicker>
        <h1 style={{ margin: "26px 0 0", fontSize: 118, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1, letterSpacing: "0.005em" }}>
          Avenida<br />Paulista.
        </h1>
        <p style={{ margin: "26px 0 0", fontSize: 42, fontWeight: 300, color: "#FFF" }}>
          A nova <span style={{ color: "#FFF", fontWeight: 600, borderBottom: `4px solid ${AZUL}` }}>Times Square</span> do Brasil.
        </p>
      </div>

      {/* Métricas na base */}
      <div style={{ position: "absolute", left: 88, right: 88, bottom: 56, display: "flex", alignItems: "stretch" }}>
        {stats.map((s, i) => (
          <div key={s.sub} style={{ flex: 1, paddingLeft: i === 0 ? 0 : 44, borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.22)" }}>
            <div style={{ fontSize: 66, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1 }}>{s.numero}</div>
            <div style={{ fontSize: 16, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-mono)", marginTop: 12 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 3. 1,5 milhão de pessoas por dia ────────────────────────────────────────
export function PaginaPaulistaFluxo() {
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center" }}>
      {/* Grafismo V sutil */}
      <svg style={{ position: "absolute", left: -120, bottom: -140, width: 560, opacity: 0.14 }} viewBox="0 0 400 400" aria-hidden>
        <polygon points="120,0 200,0 320,300 400,300 400,400 260,400" fill={AZUL} />
      </svg>

      <div style={{ flex: 1, paddingLeft: 88, maxWidth: 1000 }}>
        <Kicker>Fluxo da avenida</Kicker>
        <h1 style={{ margin: "30px 0 0", fontSize: 104, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.02 }}>
          <span style={{ color: AZUL }}>1,5 milhão</span><br />de pessoas.<br />Todos os dias.
        </h1>
        <p style={{ margin: "34px 0 0", fontSize: 27, lineHeight: 1.5, color: CINZA, maxWidth: 700 }}>
          São 2,7 km de extensão com o maior fluxo de pedestres de São Paulo —
          demanda constante por hospedagem, serviços e moradia de curta estadia.
        </p>
        <p style={{ margin: "40px 0 0", fontSize: 16, letterSpacing: "0.25em", textTransform: "uppercase", color: "#5C5C5C", fontFamily: "var(--font-mono)" }}>
          Fonte: Prefeitura de São Paulo · capital.sp.gov.br
        </p>
      </div>

      {/* Card real da busca, dentro de um tablet */}
      <div style={{ width: 900, marginRight: 88, flexShrink: 0, background: "#0D0D0D", border: "2px solid #3A3A3C", borderRadius: 42, padding: "22px 26px 30px", boxShadow: "0 50px 120px rgba(40,0,255,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 10px 14px" }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: "#E6E6E6", fontFamily: "var(--font-mono)" }}>9:41</span>
          <span style={{ fontSize: 15, color: "#898A8E", fontFamily: "var(--font-mono)" }}>Wi-Fi · 100%</span>
        </div>
        <img src="/pdf-assets/paulista-google-card.jpg" alt="Busca: quantas pessoas passam na Avenida Paulista por dia — 1,5 milhão/dia"
          style={{ width: "100%", borderRadius: 16, display: "block" }} />
      </div>
    </div>
  );
}

// ─── 4. Cinturão hospitalar — raios 500 m / 1 km / 2 km ──────────────────────
const COLUNAS_LOGOS: { alcance: string; chip: number; logoH: number; duasColunas?: boolean; logos: string[] }[] = [
  { alcance: "500 M", chip: 96, logoH: 54, logos: ["500m-01", "500m-02", "500m-03", "500m-04", "500m-05"] },
  { alcance: "1 KM", chip: 88, logoH: 50, logos: ["1km-01", "1km-02", "1km-07", "1km-03", "1km-04", "1km-05", "1km-06"] },
  { alcance: "2 KM", chip: 84, logoH: 46, duasColunas: true, logos: ["2km-01", "2km-02", "2km-10", "2km-03", "2km-04", "2km-05", "2km-06", "2km-07", "2km-08", "2km-09"] },
];

export function PaginaPaulistaHospitais() {
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", position: "relative", overflow: "hidden", display: "flex" }}>
      {/* Raios concêntricos — confinados à coluna do título, com fade antes dos logos */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 660, overflow: "hidden", pointerEvents: "none" }}>
        {[430, 760, 1090].map((r, i) => (
          <div key={r} style={{
            position: "absolute", left: 150 - r, top: 540 - r, width: r * 2, height: r * 2,
            borderRadius: "50%", border: `1.5px solid rgba(40,0,255,${0.5 - i * 0.14})`,
          }} />
        ))}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0) 45%, #000 92%)" }} />
      </div>

      {/* Coluna da marca */}
      <div style={{ width: 560, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 88, position: "relative", zIndex: 1 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 52, width: "auto", alignSelf: "flex-start" }} />
        <div style={{ marginTop: 36 }}>
          <Kicker>Saúde ao redor</Kicker>
        </div>
        <h1 style={{ margin: "22px 0 0", fontSize: 64, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.06 }}>
          Um cinturão<br />com <span style={{ color: AZUL }}>+26</span><br />hospitais.
        </h1>
      </div>

      {/* Colunas de alcance — cada logo numa célula idêntica (agrupamento uniforme) */}
      <div style={{ flex: 1, display: "flex", padding: "84px 96px 60px 40px", gap: 40, position: "relative", zIndex: 1 }}>
        {COLUNAS_LOGOS.map((c, i) => (
          <div key={c.alcance} style={{ flex: 1, paddingLeft: i === 0 ? 0 : 40, borderLeft: i === 0 ? "none" : "1px solid #1F1F1F", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <span style={{ fontSize: 46, fontWeight: 800, color: AZUL, fontFamily: "var(--font-display)" }}>{c.alcance}</span>
              <span style={{ fontSize: 16, letterSpacing: "0.22em", textTransform: "uppercase", color: "#5C5C5C", fontFamily: "var(--font-mono)" }}>
                {c.logos.length} hospitais
              </span>
            </div>
            <div style={{ width: 40, height: 3, background: "#2A2A2A", margin: "16px 0 28px" }} />
            <div style={{
              display: "grid",
              gridTemplateColumns: c.duasColunas ? "1fr 1fr" : "1fr",
              gap: 14,
              alignContent: "start",
            }}>
              {c.logos.map((l) => (
                <div key={l} style={{
                  height: c.chip,
                  background: "#0A0A0A",
                  border: "1px solid #1C1C1E",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 20px",
                }}>
                  <img src={`/pdf-assets/logo-${l}.png`} alt="" style={{ maxHeight: c.logoH, maxWidth: "84%", objectFit: "contain" }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 5. Rede de saúde — fotos dos hospitais ──────────────────────────────────
const HOSPITAIS_FOTOS: { foto: string; nome: string }[] = [
  { foto: "/pdf-assets/hosp-oswaldo-cruz.jpg", nome: "Hospital Oswaldo Cruz" },
  { foto: "/pdf-assets/hosp-beneficencia-portuguesa.jpg", nome: "Beneficência Portuguesa" },
  { foto: "/pdf-assets/hosp-santa-catarina.jpg", nome: "Hospital Santa Catarina" },
  { foto: "/pdf-assets/hosp-sancta-maggiore.jpg", nome: "Sancta Maggiore" },
  { foto: "/pdf-assets/hosp-hcor.jpg", nome: "Hospital HCor" },
  { foto: "/pdf-assets/hosp-sirio-libanes.jpg", nome: "Hospital Sírio-Libanês" },
  { foto: "/pdf-assets/hosp-santa-joana.jpg", nome: "Hospital Santa Joana" },
  { foto: "/pdf-assets/hosp-ac-camargo.jpg", nome: "Hospital A.C.Camargo" },
];

export function PaginaPaulistaSaude() {
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", display: "flex", overflow: "hidden" }}>
      {/* Coluna do título */}
      <div style={{ width: 500, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 88 }}>
        <Kicker>Saúde ao redor</Kicker>
        <h1 style={{ margin: "24px 0 0", fontSize: 72, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.05 }}>
          Rede de<br />saúde.
        </h1>
        <p style={{ margin: "28px 0 0", fontSize: 36, fontWeight: 300, color: "#FFF", lineHeight: 1.25 }}>
          Hub com <span style={{ color: AZUL, fontWeight: 700 }}>+26</span><br />hospitais.
        </p>
      </div>

      {/* Grid 4×2 de fotos com tarjas */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, padding: "72px 88px 72px 24px", alignContent: "center" }}>
        {HOSPITAIS_FOTOS.map((h) => (
          <div key={h.nome} style={{ display: "flex", flexDirection: "column" }}>
            <img src={h.foto} alt={h.nome} style={{ width: "100%", aspectRatio: "1 / 1.08", objectFit: "cover", display: "block" }} />
            <div style={{ background: "#0D0D0D", borderLeft: `3px solid ${AZUL}`, padding: "12px 12px" }}>
              <span style={{ fontSize: 14.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#E6E6E6", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                {h.nome}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 6. Maior tráfego aéreo do mundo — frota de helicópteros ─────────────────
// Ranking mundial de frota de helicópteros (São Paulo no topo). Barras
// horizontais em ordem decrescente, larguras relativas ao 1º lugar.
const RANKING_HELI: { pos: string; cidade: string; pct: number; destaque?: boolean }[] = [
  { pos: "01", cidade: "São Paulo", pct: 100, destaque: true },
  { pos: "02", cidade: "Nova York", pct: 90 },
  { pos: "03", cidade: "Tóquio", pct: 82 },
  { pos: "04", cidade: "Rio de Janeiro", pct: 75 },
  { pos: "05", cidade: "Londres", pct: 68 },
  { pos: "06", cidade: "Belo Horizonte", pct: 58 },
  { pos: "07", cidade: "Santiago", pct: 50 },
  { pos: "08", cidade: "Cidade do México", pct: 44 },
];

export function PaginaTrafegoAereo() {
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", display: "flex", overflow: "hidden", position: "relative" }}>
      {/* Grafismo V sutil */}
      <svg style={{ position: "absolute", right: -140, top: -120, width: 520, opacity: 0.1 }} viewBox="0 0 400 400" aria-hidden>
        <polygon points="120,0 200,0 320,300 400,300 400,400 260,400" fill={AZUL} />
      </svg>

      {/* Coluna do título */}
      <div style={{ width: 620, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px 0 88px", position: "relative", zIndex: 1 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 44, width: "auto", alignSelf: "flex-start", marginBottom: 40 }} />
        <Kicker>Ranking mundial</Kicker>
        <h1 style={{ margin: "24px 0 0", fontSize: 82, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.02 }}>
          Maior tráfego<br />aéreo do<br /><span style={{ color: AZUL }}>mundo.</span>
        </h1>
        <p style={{ margin: "30px 0 0", fontSize: 27, lineHeight: 1.45, color: CINZA, maxWidth: 470 }}>
          Cidades com as maiores frotas de helicópteros do mundo — e{" "}
          <span style={{ color: "#FFF", fontWeight: 600 }}>São Paulo lidera</span> o ranking.
        </p>
      </div>

      {/* Gráfico de barras horizontais */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22, padding: "72px 96px 72px 24px", position: "relative", zIndex: 1 }}>
        {RANKING_HELI.map((r) => (
          <div key={r.pos} style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* Badge de posição */}
            <div style={{
              width: 54, height: 54, flexShrink: 0, borderRadius: "50%",
              background: r.destaque ? AZUL : "#0A0A0A",
              border: `1px solid ${r.destaque ? AZUL : "#2A2A2A"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 700, color: "#FFF", fontFamily: "var(--font-mono)",
            }}>
              {r.pos}
            </div>
            {/* Cidade + barra */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 26, fontWeight: r.destaque ? 700 : 500, color: r.destaque ? "#FFF" : "#E6E6E6" }}>{r.cidade}</span>
                {r.destaque && (
                  <span style={{ fontSize: 14, letterSpacing: "0.22em", textTransform: "uppercase", color: AZUL, fontFamily: "var(--font-mono)" }}>1º lugar</span>
                )}
              </div>
              <div style={{ height: 26, borderRadius: 6, background: "#0D0D0D", overflow: "hidden" }}>
                <div style={{
                  width: `${r.pct}%`, height: "100%", borderRadius: 6,
                  background: r.destaque ? AZUL : "linear-gradient(90deg, rgba(40,0,255,0.2), rgba(40,0,255,0.8))",
                  boxShadow: r.destaque ? "0 0 40px rgba(40,0,255,0.6)" : "none",
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 5. Centro de Convenções Frei Caneca — a 2 minutos a pé ──────────────────
// Números do material interno da Vitacon, a pedido. Ressalva registrada: o
// balanço público do próprio centro (via UBRAFE) informa 378 mil visitantes em
// 2024 e projeta 425 mil para 2025 — o "+1 milhão" parece vir do acumulado
// histórico (9,6 mi desde 2001). Por isso a fonte aqui credita o levantamento
// Vitacon, e não o centro/UBRAFE, que não publicam esse número.
const FREI_CANECA_STATS: { numero: string; label: string }[] = [
  { numero: "+1 milhão", label: "Visitantes por ano" },
  { numero: "270", label: "Feiras, congressos e reuniões/ano" },
  { numero: "3.800", label: "Lugares sentados" },
];

export function PaginaFreiCaneca() {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000", fontFamily: "var(--font-sans)" }}>
      <img src="/pdf-assets/frei-caneca.png" alt="Fachada do Centro de Convenções Frei Caneca"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.8) 24%, rgba(0,0,0,0.52) 46%, rgba(0,0,0,0.26) 70%, rgba(0,0,0,0.12) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 22%, rgba(0,0,0,0.2) 42%, rgba(0,0,0,0) 60%)" }} />

      <div style={{ position: "absolute", top: 64, left: 88 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto" }} />
      </div>

      <div style={{ position: "absolute", left: 88, bottom: 92, maxWidth: 1120 }}>
        <Kicker corTexto="rgba(255,255,255,0.88)">Centro de Convenções · A 2 minutos a pé</Kicker>

        <h1 style={{ margin: "26px 0 0", fontSize: 76, fontWeight: 300, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.1, letterSpacing: "0.005em", textShadow: "0 3px 22px rgba(0,0,0,0.55)" }}>
          O complexo de eventos<br />
          <span style={{ fontWeight: 800 }}>mais movimentado do centro.</span>
        </h1>

        <p style={{ margin: "26px 0 0", fontSize: 24, fontWeight: 300, color: "rgba(255,255,255,0.78)", lineHeight: 1.5, maxWidth: 780 }}>
          Feiras, congressos e reuniões corporativas o ano inteiro, na região central
          de São Paulo. Congressistas chegam de fora, ficam poucos dias — e dormem perto.
        </p>

        <div style={{ display: "flex", gap: 46, marginTop: 44 }}>
          {FREI_CANECA_STATS.map((s, i) => (
            <div key={s.label} style={{ paddingLeft: i === 0 ? 0 : 46, borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: 46, fontWeight: 800, fontFamily: "var(--font-display)", lineHeight: 1, whiteSpace: "nowrap", color: i === 0 ? "#FFF" : "rgba(255,255,255,0.55)" }}>
                {s.numero}
              </div>
              <div style={{ fontSize: 15, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginTop: 12, color: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <p style={{ margin: "36px 0 0", fontSize: 15, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-mono)" }}>
          Fonte: levantamento Vitacon
        </p>
      </div>
    </div>
  );
}

// ─── 6. Universidade Mackenzie — hospedagem oficial ──────────────────────────
// Card claro no padrão "consulta de mercado": pergunta, resposta em destaque e
// fonte creditada. Não imita a interface do Google — campo de busca e lupa são
// padrões genéricos; a peça se identifica como nossa.
const MACKENZIE_DETALHE: { label: string; valor: string }[] = [
  { label: "Campi (Higienópolis, Alphaville, Campinas)", valor: "3" },
  { label: "Cursos de graduação presencial", valor: "30" },
  { label: "Cursos de pós-graduação presencial", valor: "74" },
];

export function PaginaMackenzie() {
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center" }}>
      {/* Grafismo V sutil */}
      <svg style={{ position: "absolute", left: -120, bottom: -140, width: 560, opacity: 0.12 }} viewBox="0 0 400 400" aria-hidden>
        <polygon points="120,0 200,0 320,300 400,300 400,400 260,400" fill={AZUL} />
      </svg>

      <div style={{ flex: 1, paddingLeft: 88, maxWidth: 900, position: "relative", zIndex: 1 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto", display: "block", marginBottom: 48 }} />
        <Kicker>Parceria exclusiva</Kicker>

        <h1 style={{ margin: "32px 0 0", fontSize: 62, fontWeight: 300, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.12 }}>
          Hospedagem oficial da<br />
          <span style={{ fontWeight: 800 }}>Universidade Mackenzie.</span>
        </h1>

        <p style={{ margin: "32px 0 0", fontSize: 23, fontWeight: 300, color: CINZA, lineHeight: 1.55, maxWidth: 660 }}>
          Alunos, pais, professores e palestrantes circulam pelo campus o ano inteiro —
          e precisam de estadia curta a poucos metros dele.
        </p>

        <div style={{ display: "flex", gap: 40, marginTop: 56 }}>
          {[{ n: "36 mil", l: "Alunos" }, { n: "3", l: "Campi" }, { n: "1870", l: "Fundação" }].map((s, i) => (
            <div key={s.l} style={{ paddingLeft: i === 0 ? 0 : 40, borderLeft: i === 0 ? "none" : "1px solid #2A2A2A" }}>
              <div style={{ fontSize: 38, fontWeight: 800, fontFamily: "var(--font-display)", lineHeight: 1, whiteSpace: "nowrap", color: i === 0 ? "#FFF" : "rgba(255,255,255,0.5)" }}>{s.n}</div>
              <div style={{ fontSize: 15, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginTop: 12, color: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)" }}>{s.l}</div>
            </div>
          ))}
        </div>

        <p style={{ margin: "48px 0 0", fontSize: 15, letterSpacing: "0.25em", textTransform: "uppercase", color: "#5C5C5C", fontFamily: "var(--font-mono)" }}>
          Fonte: mackenzie.br
        </p>
      </div>

      {/* Card claro — consulta com a miniatura da busca */}
      <div style={{ width: 820, marginLeft: "auto", marginRight: 88, flexShrink: 0, background: "#FFF", borderRadius: 20, padding: "52px 56px", boxShadow: "0 50px 120px rgba(40,0,255,0.28)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
          <div style={{ width: 44, height: 3, background: AZUL }} />
          <span style={{ fontSize: 16, letterSpacing: "0.28em", textTransform: "uppercase", color: AZUL, fontFamily: "var(--font-mono)" }}>
            Consulta
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#F4F4F7", border: "1px solid #E2E2E8", borderRadius: 999, padding: "18px 26px" }}>
          <span style={{ flex: 1, fontSize: 22, color: "#2A2A30", lineHeight: 1.3 }}>
            quantos alunos tem a faculdade Mackenzie
          </span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={AZUL} strokeWidth="2.2" style={{ flexShrink: 0 }} aria-hidden>
            <circle cx="11" cy="11" r="7" /><path d="M16.5 16.5 21 21" strokeLinecap="round" />
          </svg>
        </div>

        <div style={{ display: "flex", gap: 32, marginTop: 32, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 76, fontWeight: 800, color: AZUL, fontFamily: "var(--font-display)", lineHeight: 1 }}>
              36 mil
            </div>
            <p style={{ margin: "16px 0 0", fontSize: 22, color: "#0A0A0C", fontWeight: 500, lineHeight: 1.4 }}>
              alunos em três campi e no EaD.
            </p>
          </div>
          <img src="/pdf-assets/mackenzie-thumb.jpg" alt="Campus da Universidade Presbiteriana Mackenzie"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            style={{ width: 244, height: "auto", borderRadius: 12, display: "block", flexShrink: 0 }} />
        </div>

        <div style={{ height: 1, background: "#E4E4E8", margin: "34px 0 28px" }} />

        {MACKENZIE_DETALHE.map((d, i) => (
          <div key={d.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 24, marginTop: i === 0 ? 0 : 18 }}>
            <span style={{ fontSize: 20, color: "#5A5A61", lineHeight: 1.35 }}>{d.label}</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#0A0A0C", fontFamily: "var(--font-display)" }}>{d.valor}</span>
          </div>
        ))}

        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 32 }}>
          {["mackenzie.br", "ago. 2023"].map((f) => (
            <span key={f} style={{ fontSize: 16, color: "#5A5A61", background: "#F4F4F7", border: "1px solid #E2E2E8", borderRadius: 999, padding: "8px 16px" }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 7. Pacaembu — arena de shows e centro de convenções ─────────────────────
// Números conferidos: 25.500 lugares para futebol, mas até 40 mil em shows
// (arquibancadas + campo). O Mercado Pago Hall comporta 9 mil. Reaberto em
// 25/01/2025 sob concessão Allegra, com naming rights do Mercado Livre.
const PACAEMBU_SHOWS: { numero: string; label: string }[] = [
  { numero: "40 mil", label: "Pessoas em noite de show" },
  { numero: "25.500", label: "Lugares em jogo de futebol" },
  { numero: "R$ 1 bi", label: "Investimento no complexo" },
];
const PACAEMBU_COMPLEXO: { numero: string; label: string }[] = [
  { numero: "9 mil", label: "Pessoas no centro de convenções" },
  { numero: "35 anos", label: "Concessão do complexo" },
  { numero: "2025", label: "Reabertura" },
];

/** Moldura comum das duas páginas do Pacaembu. */
function PaginaPacaembuBase({ src, alt, kicker, titulo, texto, stats, fonte }: {
  src: string; alt: string; kicker: string; titulo: React.ReactNode;
  texto: React.ReactNode; stats: { numero: string; label: string }[]; fonte: string;
}) {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000", fontFamily: "var(--font-sans)" }}>
      <img src={src} alt={alt} onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.76) 24%, rgba(0,0,0,0.48) 46%, rgba(0,0,0,0.22) 70%, rgba(0,0,0,0.08) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 22%, rgba(0,0,0,0.2) 42%, rgba(0,0,0,0) 60%)" }} />

      <div style={{ position: "absolute", top: 64, left: 88 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto" }} />
      </div>

      <div style={{ position: "absolute", left: 88, bottom: 92, maxWidth: 1120 }}>
        <Kicker corTexto="rgba(255,255,255,0.88)">{kicker}</Kicker>

        <h1 style={{ margin: "26px 0 0", fontSize: 72, fontWeight: 300, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.1, letterSpacing: "0.005em", textShadow: "0 3px 22px rgba(0,0,0,0.55)" }}>
          {titulo}
        </h1>

        <p style={{ margin: "26px 0 0", fontSize: 24, fontWeight: 300, color: "rgba(255,255,255,0.78)", lineHeight: 1.5, maxWidth: 780 }}>
          {texto}
        </p>

        <div style={{ display: "flex", gap: 46, marginTop: 44 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ paddingLeft: i === 0 ? 0 : 46, borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.2)", maxWidth: 280 }}>
              <div style={{ fontSize: 46, fontWeight: 800, fontFamily: "var(--font-display)", lineHeight: 1, whiteSpace: "nowrap", color: i === 0 ? "#FFF" : "rgba(255,255,255,0.55)" }}>
                {s.numero}
              </div>
              <div style={{ fontSize: 15, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginTop: 12, lineHeight: 1.45, color: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <p style={{ margin: "36px 0 0", fontSize: 15, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-mono)" }}>
          {fonte}
        </p>
      </div>
    </div>
  );
}

export function PaginaPacaembuArena() {
  return (
    <PaginaPacaembuBase
      src="/pdf-assets/pacaembu-arena.jpg"
      alt="Novo Pacaembu — Estádio Municipal Paulo Machado de Carvalho reformado, iluminado à noite"
      kicker="Pacaembu · Arena de shows"
      titulo={<>40 mil pessoas<br /><span style={{ fontWeight: 800 }}>em noite de show.</span></>}
      texto={<>Com o campo liberado e as arquibancadas cheias, a arena recebe os grandes shows internacionais que passam por São Paulo — e o público que vem de fora precisa dormir por perto.</>}
      stats={PACAEMBU_SHOWS}
      fonte="Fontes: Allegra Pacaembu · CNN Brasil"
    />
  );
}

export function PaginaPacaembuComplexo() {
  return (
    <PaginaPacaembuBase
      src="/pdf-assets/pacaembu-complexo.jpg"
      alt="Vista aérea do complexo do Pacaembu, com arena, edifício multiuso, piscina e quadras"
      kicker="Pacaembu · Complexo multiuso"
      titulo={<>Não é só um estádio.<br /><span style={{ fontWeight: 800 }}>É um complexo.</span></>}
      texto={<>No lugar do antigo Tobogã, um edifício multiuso reúne centro de convenções, hotel, restaurantes e lojas. Evento corporativo de dia, show à noite, o ano inteiro.</>}
      stats={PACAEMBU_COMPLEXO}
      fonte="Fontes: Allegra Pacaembu · Meio & Mensagem"
    />
  );
}

// ─── 8. ESPM — demanda de longa permanência ──────────────────────────────────
// Foto full-bleed + card claro de consulta à direita. Números conferidos com a
// busca fornecida (12.600 alunos, 5 campi). O card se identifica como peça
// nossa: não reproduz logo, cores ou interface do buscador.
const ESPM_DETALHE: { label: string; valor: string }[] = [
  { label: "Campi (SP, Rio e Porto Alegre)", valor: "5" },
  { label: "Anos de excelência acadêmica", valor: "+70" },
];

export function PaginaEspm() {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000", fontFamily: "var(--font-sans)" }}>
      <img src="/pdf-assets/espm.jpg" alt="Entrada do campus da ESPM"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.86) 26%, rgba(0,0,0,0.7) 46%, rgba(0,0,0,0.62) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 24%, rgba(0,0,0,0.1) 46%, rgba(0,0,0,0.3) 100%)" }} />

      <div style={{ position: "absolute", top: 64, left: 88 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto" }} />
      </div>

      {/* Alinhado ao topo do card da direita (200), para os dois blocos lerem como par */}
      <div style={{ position: "absolute", left: 88, top: 200, maxWidth: 860 }}>
        <Kicker corTexto="rgba(255,255,255,0.88)">ESPM · Demanda embarcada</Kicker>

        <h1 style={{ margin: "26px 0 0", fontSize: 68, fontWeight: 300, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.1, letterSpacing: "0.005em", textShadow: "0 3px 22px rgba(0,0,0,0.6)" }}>
          Aula o ano inteiro.<br />
          <span style={{ fontWeight: 800 }}>Ocupação também.</span>
        </h1>

        <p style={{ margin: "26px 0 0", fontSize: 23, fontWeight: 300, color: "rgba(255,255,255,0.82)", lineHeight: 1.55, maxWidth: 780, textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}>
          Aluno de fora, intercambista e executivo em MBA não alugam por uma noite:
          ficam semanas ou meses. É a estadia que rende mais e desocupa menos —
          e ela se renova a cada semestre, sem baixa temporada.
        </p>

        <p style={{ margin: "32px 0 0", fontSize: 15, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)", fontFamily: "var(--font-mono)" }}>
          Fonte: ESPM · LinkedIn
        </p>
      </div>

      {/* Card claro de consulta */}
      <div style={{ position: "absolute", right: 88, top: 200, width: 780, background: "#FFF", borderRadius: 20, padding: "48px 52px", boxShadow: "0 50px 120px rgba(0,0,0,0.55)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
          <div style={{ width: 44, height: 3, background: AZUL }} />
          <span style={{ fontSize: 16, letterSpacing: "0.28em", textTransform: "uppercase", color: AZUL, fontFamily: "var(--font-mono)" }}>
            Consulta
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#F4F4F7", border: "1px solid #E2E2E8", borderRadius: 999, padding: "17px 26px" }}>
          <span style={{ flex: 1, fontSize: 22, color: "#2A2A30", lineHeight: 1.3 }}>espm quantos alunos tem</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={AZUL} strokeWidth="2.2" style={{ flexShrink: 0 }} aria-hidden>
            <circle cx="11" cy="11" r="7" /><path d="M16.5 16.5 21 21" strokeLinecap="round" />
          </svg>
        </div>

        <div style={{ display: "flex", gap: 30, marginTop: 30, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 76, fontWeight: 800, color: AZUL, fontFamily: "var(--font-display)", lineHeight: 1 }}>
              12.600
            </div>
            <p style={{ margin: "16px 0 0", fontSize: 22, color: "#0A0A0C", fontWeight: 500, lineHeight: 1.4 }}>
              alunos em graduação e pós-graduação.
            </p>
          </div>
          <img src="/pdf-assets/espm-thumb.jpg" alt="ESPM"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            style={{ width: 136, height: 136, borderRadius: 12, display: "block", flexShrink: 0 }} />
        </div>

        <div style={{ height: 1, background: "#E4E4E8", margin: "32px 0 26px" }} />

        {ESPM_DETALHE.map((d, i) => (
          <div key={d.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 24, marginTop: i === 0 ? 0 : 18 }}>
            <span style={{ fontSize: 20, color: "#5A5A61", lineHeight: 1.35 }}>{d.label}</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#0A0A0C", fontFamily: "var(--font-display)" }}>{d.valor}</span>
          </div>
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 30 }}>
          {["espm.br", "LinkedIn · ESPM"].map((f) => (
            <span key={f} style={{ fontSize: 16, color: "#5A5A61", background: "#F4F4F7", border: "1px solid #E2E2E8", borderRadius: 999, padding: "8px 16px" }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 9. Hospitais do cinturão — Sírio, Oswaldo Cruz e BP ─────────────────────
// Mesma moldura para os três: foto full-bleed, manchete no canto inferior,
// régua de números e fonte. Números conferidos nas fontes citadas em cada
// página; onde as fontes divergiam, entrou o valor mais conservador.
function PaginaHospital({ foto, alt, kicker, titulo, destaque, texto, stats, fonte, logo }: {
  foto: string; alt: string; kicker: string; titulo: string; destaque: string; texto: string;
  stats: { numero: string; label: string }[]; fonte: string; logo?: React.ReactNode;
}) {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000", fontFamily: "var(--font-sans)" }}>
      <img src={foto} alt={alt} onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.78) 24%, rgba(0,0,0,0.5) 46%, rgba(0,0,0,0.24) 70%, rgba(0,0,0,0.1) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 22%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0) 60%)" }} />

      <div style={{ position: "absolute", top: 64, left: 88 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto" }} />
      </div>
      {logo}

      <div style={{ position: "absolute", left: 88, bottom: 92, maxWidth: 1160 }}>
        <Kicker corTexto="rgba(255,255,255,0.88)">{kicker}</Kicker>

        <h1 style={{ margin: "26px 0 0", fontSize: 72, fontWeight: 300, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.1, letterSpacing: "0.005em", textShadow: "0 3px 22px rgba(0,0,0,0.6)" }}>
          {titulo}<br />
          <span style={{ fontWeight: 800 }}>{destaque}</span>
        </h1>

        <p style={{ margin: "26px 0 0", fontSize: 23, fontWeight: 300, color: "rgba(255,255,255,0.82)", lineHeight: 1.5, maxWidth: 780, textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}>
          {texto}
        </p>

        <div style={{ display: "flex", gap: 46, marginTop: 44 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ paddingLeft: i === 0 ? 0 : 46, borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.2)", maxWidth: 320 }}>
              <div style={{ fontSize: 46, fontWeight: 800, fontFamily: "var(--font-display)", lineHeight: 1, whiteSpace: "nowrap", color: i === 0 ? "#FFF" : "rgba(255,255,255,0.55)" }}>
                {s.numero}
              </div>
              <div style={{ fontSize: 15, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginTop: 12, lineHeight: 1.45, color: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <p style={{ margin: "36px 0 0", fontSize: 15, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)" }}>
          {fonte}
        </p>
      </div>
    </div>
  );
}

export function PaginaSirioBelaVista() {
  return (
    <PaginaHospital
      foto="/pdf-assets/sirio-bela-vista.jpg"
      alt="Fachada do Hospital Sírio-Libanês, na Bela Vista"
      kicker="Bela Vista · Rede de saúde"
      titulo="Entre os melhores"
      destaque="hospitais do mundo."
      texto="Pelo 7º ano seguido no ranking mundial da Newsweek, presente nas 12 especialidades avaliadas. Paciente, acompanhante e corpo clínico chegam de todo o Brasil — e dormem perto."
      stats={[
        { numero: "+4 mil", label: "Médicos no corpo clínico" },
        { numero: "120 mil", label: "Pacientes por ano" },
        { numero: "JCI", label: "Acreditação desde 2007" },
      ]}
      fonte="Fontes: Sírio-Libanês · Newsweek 2026"
      logo={
        <div style={{ position: "absolute", top: 56, right: 88, background: "rgba(255,255,255,0.92)", borderRadius: 12, padding: "16px 22px" }}>
          <img src="/pdf-assets/sirio-logo.svg" alt="Hospital Sírio-Libanês" style={{ height: 54, width: "auto", display: "block" }} />
        </div>
      }
    />
  );
}

export function PaginaOswaldoCruz() {
  return (
    <PaginaHospital
      foto="/pdf-assets/oswaldo-cruz-paulista.jpg"
      alt="Entrada do Hospital Alemão Oswaldo Cruz, no Paraíso"
      kicker="Paulista · Rede de saúde"
      titulo="Tradição alemã"
      destaque="desde 1897."
      texto="Um dos maiores corpos clínicos do país e acreditação máxima da Joint Commission International. A cada consulta e internação, demanda por estadia curta na porta do empreendimento."
      stats={[
        { numero: "+5,6 mil", label: "Médicos ativos" },
        { numero: "805", label: "Leitos" },
        { numero: "JCI", label: "Acreditado 4 vezes" },
      ]}
      fonte="Fonte: Hospital Alemão Oswaldo Cruz"
    />
  );
}

export function PaginaBP() {
  return (
    <PaginaHospital
      foto="/pdf-assets/bp-bela-vista.jpg"
      alt="Complexo da BP — Beneficência Portuguesa, na Bela Vista"
      kicker="Bela Vista · Rede de saúde"
      titulo="O maior polo privado de"
      destaque="saúde da América Latina."
      texto="Desde 1859, referência em cardiologia, oncologia e transplantes. São milhões de pacientes por ano circulando a poucos minutos daqui — com acompanhantes que precisam de onde ficar."
      stats={[
        { numero: "1,8 mi", label: "Pacientes por ano" },
        { numero: "+3 mil", label: "Médicos" },
        { numero: "+1.000", label: "Leitos" },
      ]}
      fonte="Fonte: BP — A Beneficência Portuguesa de São Paulo"
    />
  );
}
