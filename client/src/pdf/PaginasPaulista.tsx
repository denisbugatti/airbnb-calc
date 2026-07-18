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

// ─── 2. Times Square Paulistana — LEDs liberados ─────────────────────────────
export function PaginaPaulistaTimesSquare() {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000", fontFamily: "var(--font-sans)" }}>
      <img src="/pdf-assets/paulista-neon.jpg" alt="Times Square Paulistana"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.08) 100%)" }} />

      <div style={{ position: "absolute", left: 88, top: 96 }}>
        <Kicker>Times Square Paulistana</Kicker>
      </div>

      <div style={{ position: "absolute", left: 88, top: 248, maxWidth: 860 }}>
        <h1 style={{ margin: 0, fontSize: 78, fontWeight: 400, color: "#FFF", lineHeight: 1.14 }}>
          Agora os prédios podem ter <span style={{ fontWeight: 700, color: "#FFF", borderBottom: `5px solid ${AZUL}` }}>painéis de LED</span>, igual à Times Square.
        </h1>
        <p style={{ margin: "30px 0 0", fontSize: 27, lineHeight: 1.5, color: "rgba(255,255,255,0.78)", maxWidth: 660 }}>
          A Câmara de São Paulo flexibilizou a Lei Cidade Limpa: a Paulista entra na era dos
          letreiros luminosos — mais fluxo, mais vitrine, mais valor por metro quadrado.
        </p>
      </div>

      {/* Card da manchete (recriado em vetor) */}
      <div style={{ position: "absolute", left: 88, bottom: 72, width: 780, background: "#FFFFFF", borderRadius: 16, padding: "34px 38px", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.18em", color: "#0A0A0B", fontFamily: "var(--font-mono)" }}>O GLOBO</span>
          <span style={{ width: 4, height: 4, borderRadius: 99, background: "#B3B3B3" }} />
          <span style={{ fontSize: 14, color: "#737373", fontFamily: "var(--font-mono)" }}>SÃO PAULO · 29/05/2025</span>
        </div>
        <p style={{ margin: 0, fontSize: 27, fontWeight: 700, lineHeight: 1.3, color: "#0A0A0B" }}>
          ‘Times Square paulistana’: vereadores e painéis de LED avançam sobre a Lei Cidade Limpa
        </p>
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

      {/* Card real da busca */}
      <div style={{ width: 700, marginRight: 96, flexShrink: 0 }}>
        <img src="/pdf-assets/paulista-google-card.jpg" alt="Busca: quantas pessoas passam na Avenida Paulista por dia — 1,5 milhão/dia"
          style={{ width: "100%", borderRadius: 18, boxShadow: "0 40px 100px rgba(40,0,255,0.22)" }} />
      </div>
    </div>
  );
}

// ─── 4. Cinturão hospitalar — raios 500 m / 1 km / 2 km ──────────────────────
const RAIOS: { alcance: string; hospitais: string[] }[] = [
  {
    alcance: "500 M",
    hospitais: ["Hospital Sírio-Libanês", "Hospital Oswaldo Cruz", "Sancta Maggiore", "Hospital Santa Catarina", "Fleury"],
  },
  {
    alcance: "1 KM",
    hospitais: ["Pro Matre Paulista", "Santa Maria · Grupo Santa Joana", "Hospital SAHA", "Hospital Paulistano", "HCor", "Grupo H.Olhos", "Santa Joana"],
  },
  {
    alcance: "2 KM",
    hospitais: ["Hospital Samaritano", "Leforte", "Albert Einstein", "Hospital IGESP", "BP — Beneficência Portuguesa", "Santa Rita", "Hospital Nove de Julho", "A.C.Camargo Cancer Center", "Hospital Luz"],
  },
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
      <div style={{ position: "absolute", left: 136, top: 526, width: 28, height: 28, borderRadius: 99, background: AZUL, boxShadow: "0 0 60px rgba(40,0,255,0.9)" }} />

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

      {/* Colunas de alcance */}
      <div style={{ flex: 1, display: "flex", padding: "110px 96px 90px 40px", gap: 56 }}>
        {RAIOS.map((r, i) => (
          <div key={r.alcance} style={{ flex: 1, paddingLeft: i === 0 ? 0 : 56, borderLeft: i === 0 ? "none" : "1px solid #1F1F1F" }}>
            <div style={{ fontSize: 46, fontWeight: 800, color: AZUL, fontFamily: "var(--font-display)" }}>{r.alcance}</div>
            <div style={{ width: 40, height: 3, background: "#2A2A2A", margin: "18px 0 30px" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 21 }}>
              {r.hospitais.map((h) => (
                <span key={h} style={{ fontSize: 23, fontWeight: 500, color: "#E6E6E6", lineHeight: 1.25 }}>{h}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
