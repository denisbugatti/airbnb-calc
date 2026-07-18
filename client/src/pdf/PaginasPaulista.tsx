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

function Kicker({ children, cor = AZUL }: { children: React.ReactNode; cor?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 44, height: 3, background: cor }} />
      <span style={{ fontSize: 19, letterSpacing: "0.3em", textTransform: "uppercase", color: cor, fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
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
const COLUNAS_LOGOS: { alcance: string; img: string }[] = [
  { alcance: "500 M", img: "/pdf-assets/logos-500m.png" },
  { alcance: "1 KM", img: "/pdf-assets/logos-1km.png" },
  { alcance: "2 KM", img: "/pdf-assets/logos-2km.png" },
];

export function PaginaPaulistaHospitais() {
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", position: "relative", overflow: "hidden", display: "flex" }}>
      {/* Raios concêntricos */}
      {[430, 760, 1090].map((r, i) => (
        <div key={r} style={{
          position: "absolute", left: 150 - r, top: 540 - r, width: r * 2, height: r * 2,
          borderRadius: "50%", border: `1.5px solid rgba(40,0,255,${0.5 - i * 0.14})`,
        }} />
      ))}

      {/* Coluna da marca */}
      <div style={{ width: 560, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 88 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 52, width: "auto", alignSelf: "flex-start" }} />
        <div style={{ marginTop: 36 }}>
          <Kicker>Saúde ao redor</Kicker>
        </div>
        <h1 style={{ margin: "22px 0 0", fontSize: 64, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.06 }}>
          Um cinturão<br />com <span style={{ color: AZUL }}>+26</span><br />hospitais.
        </h1>
      </div>

      {/* Colunas de alcance — logos oficiais dos hospitais */}
      <div style={{ flex: 1, display: "flex", padding: "96px 96px 70px 40px", gap: 48 }}>
        {COLUNAS_LOGOS.map((c, i) => (
          <div key={c.alcance} style={{ flex: 1, paddingLeft: i === 0 ? 0 : 48, borderLeft: i === 0 ? "none" : "1px solid #1F1F1F", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 46, fontWeight: 800, color: AZUL, fontFamily: "var(--font-display)" }}>{c.alcance}</div>
            <div style={{ width: 40, height: 3, background: "#2A2A2A", margin: "18px 0 26px" }} />
            <img src={c.img} alt={`Hospitais a ${c.alcance}`} style={{ width: "100%", maxHeight: 800, objectFit: "contain", objectPosition: "top left" }} />
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
