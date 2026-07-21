/**
 * PaginasVitacon.tsx — as 4 páginas institucionais "Sobre a Vitacon" do PDF.
 * Formato 1920×1080. Identidade: preto #000 · azul #2800FF · branco.
 *
 * 1. Institucional  — título + 3 métricas + print oficial do Reclame Aqui
 * 2. Entregas       — infográfico "Últimas entregas" (arte 2K pronta)
 * 3. ChatGPT        — prova social com o print da resposta do ChatGPT
 * 4. Valorização    — 92%: topo 100% vetorial + fotos nativas dos prédios com
 *                     barras e textos redesenhados em vetor (nitidez máxima)
 */

const AZUL = "#2800FF";
const CINZA = "#898A8E";

// ─── 1. Institucional + Reclame Aqui ─────────────────────────────────────────
export function PaginaInstitucional() {
  const stats = [
    { numero: "+150", sub: "Projetos desenvolvidos" },
    { numero: "+10 mil", sub: "Unidades" },
    { numero: "17", sub: "Anos de mercado" },
    { numero: "R$8bi", sub: "VGV acumulado" },
  ];
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", padding: "64px 96px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden" }}>
      {/* Grafismo V sutil */}
      <svg style={{ position: "absolute", right: -80, top: -80, width: 480, opacity: 0.16 }} viewBox="0 0 400 400" aria-hidden>
        <polygon points="120,0 200,0 320,300 400,300 400,400 260,400" fill={AZUL} />
      </svg>
      <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 54, width: "auto" }} />
      <h1 style={{ margin: "36px 0 10px", fontSize: 62, fontWeight: 400, color: "#FFF", textAlign: "center", lineHeight: 1.1 }}>
        Nós entendemos de <span style={{ color: AZUL, fontWeight: 600 }}>compacto de luxo.</span>
      </h1>
      <p style={{ fontSize: 26, color: CINZA, margin: 0 }}>A melhor em investimentos imobiliários.</p>

      <div style={{ display: "flex", gap: 20, marginTop: 44 }}>
        {stats.map((s) => (
          <div key={s.sub} style={{ width: 300, padding: "30px 20px", border: "1px solid #2A2A2A", background: "#0A0A0A", textAlign: "center" }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: AZUL, fontFamily: "var(--font-display)" }}>{s.numero}</div>
            <div style={{ fontSize: 15, letterSpacing: "0.22em", textTransform: "uppercase", color: CINZA, fontFamily: "var(--font-mono)", marginTop: 10 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Print oficial do Reclame Aqui (mantido como está) */}
      <img src="/pdf-assets/print-reclameaqui.png" alt="Vitacon no Reclame Aqui"
        style={{ marginTop: 44, width: 940, borderRadius: 14, border: "1px solid #2A2A2A", boxShadow: "0 30px 80px rgba(40,0,255,0.18)" }} />
    </div>
  );
}

// ─── 2. Últimas entregas (arte 2K pronta em identidade azul) ─────────────────
export function PaginaEntregas() {
  return <img src="/pdf-assets/entregas-2k.jpg" alt="Últimas entregas Vitacon" style={{ width: 1920, height: 1080, display: "block", objectFit: "cover" }} />;
}

// ─── 3. Até o ChatGPT sabe ───────────────────────────────────────────────────
export function PaginaChatGPT() {
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", padding: "72px 96px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 44, height: 3, background: AZUL }} />
        <span style={{ fontSize: 19, letterSpacing: "0.3em", textTransform: "uppercase", color: AZUL, fontFamily: "var(--font-mono)" }}>
          Até o ChatGPT sabe
        </span>
        <div style={{ width: 44, height: 3, background: AZUL }} />
      </div>
      <h1 style={{ margin: "26px 0 0", fontSize: 56, fontWeight: 400, color: "#FFF", textAlign: "center", lineHeight: 1.18, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", columnGap: 18, maxWidth: 1500 }}>
        <span>Quem é a melhor incorporadora de studios do Brasil?</span>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 46, width: "auto", transform: "translateY(6px)" }} />
      </h1>

      {/* Print da conversa (mantido como está) */}
      <img src="/pdf-assets/print-chatgpt.png" alt="Resposta do ChatGPT"
        style={{ marginTop: 36, width: 800, borderRadius: 14, border: "1px solid #2A2A2A", boxShadow: "0 30px 80px rgba(0,0,0,0.65)" }} />

      <p style={{ marginTop: 34, fontSize: 26, fontStyle: "italic", color: "#B3B3B3" }}>
        “Praticamente um FII físico disfarçado de imóvel.” <span style={{ color: CINZA }}>— ChatGPT</span>
      </p>
    </div>
  );
}

// ─── 4. Valorização média 92% (HD: topo vetorial + barras/textos redesenhados) ─
interface Predio {
  nome: string; pct: string; vLanc: string; vAtual: string;
  /** posição/tamanho da barra azul na faixa de fotos (coords do strip 1920×760) */
  azul: { x: number; w: number; top: number };
  /** barra cinza: x/w (cobre a baked quando existe) e altura proporcional ao valor */
  cinza: { x: number; w: number; h: number };
}

const PREDIOS: Predio[] = [
  { nome: "VN Capote Valente", pct: "+178%", vLanc: "R$ 11.280", vAtual: "R$ 31.400",
    azul: { x: 244, w: 106, top: 374 }, cinza: { x: 110, w: 116, h: 138 } },
  { nome: "VN Frei Caneca", pct: "+69%", vLanc: "R$ 14.140", vAtual: "R$ 23.900",
    azul: { x: 727, w: 106, top: 469 }, cinza: { x: 593, w: 116, h: 172 } },
  { nome: "VN Millennium Faria Lima", pct: "+64%", vLanc: "R$ 19.100", vAtual: "R$ 31.300",
    azul: { x: 1208, w: 106, top: 434 }, cinza: { x: 1072, w: 121, h: 198 } },
  { nome: "VN Oscar Freire", pct: "+86%", vLanc: "R$ 16.150", vAtual: "R$ 30.000",
    azul: { x: 1691, w: 106, top: 434 }, cinza: { x: 1564, w: 122, h: 175 } },
];

const STRIP_TOP = 320; // altura do cabeçalho branco; a faixa de fotos ocupa 760px até o rodapé

export function PaginaValorizacao() {
  return (
    <div style={{ width: 1920, height: 1080, background: "#FFFFFF", fontFamily: "var(--font-sans)", position: "relative", overflow: "hidden" }}>
      {/* Cabeçalho branco — 100% vetorial */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: STRIP_TOP, display: "flex", alignItems: "center", padding: "0 88px", gap: 44 }}>
        <span style={{ fontSize: 150, fontWeight: 800, color: AZUL, fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1 }}>
          92%
        </span>
        <span style={{ fontSize: 44, fontWeight: 500, color: "#9A9A9E", textTransform: "uppercase", lineHeight: 1.22, letterSpacing: "0.04em", maxWidth: 560 }}>
          É a média de valorização de um Vitacon
        </span>
        <p style={{ marginLeft: "auto", maxWidth: 470, fontSize: 17, lineHeight: 1.55, color: "#737373" }}>
          O índice da valorização dos produtos é calculado considerando a data base de lançamento × valor atual
          (variando de produto a produto de 2017 a 2024). Média considerando os projetos: VN Capote Valente,
          VN Frei Caneca, VN Millenium Faria Lima e VN Oscar Freire.
        </p>
        <div style={{ width: 68, height: 68, borderRadius: 16, background: AZUL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#FFF", fontSize: 42, fontWeight: 800, fontFamily: "var(--font-display)", fontStyle: "italic" }}>V</span>
        </div>
      </div>

      {/* Faixa de fotos nativas */}
      <img src="/pdf-assets/valorizacao-strip.jpg" alt="" style={{ position: "absolute", top: STRIP_TOP, left: 0, width: 1920, height: 760, display: "block" }} />

      {/* Overlays vetoriais por prédio */}
      {PREDIOS.map((p, i) => {
        const centroCol = i * 480 + 240;
        const azulTopo = STRIP_TOP + p.azul.top;
        return (
          <div key={p.nome}>
            {/* Barra azul (vetorial, cobre a original com cor exata da marca) */}
            <div style={{ position: "absolute", left: p.azul.x, top: azulTopo, width: p.azul.w, height: 1080 - azulTopo, background: AZUL }} />
            {/* Barra cinza */}
            <div style={{ position: "absolute", left: p.cinza.x, top: 1080 - p.cinza.h, width: p.cinza.w, height: p.cinza.h, background: "#8A8A8E" }} />
            {/* Percentual + nome */}
            <div style={{ position: "absolute", left: centroCol, top: azulTopo - 158, transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
              <div style={{ fontSize: 74, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", textShadow: "0 4px 26px rgba(0,0,0,0.85)", lineHeight: 1 }}>
                {p.pct}
              </div>
              <div style={{ fontSize: 25, fontWeight: 500, color: "#FFF", textShadow: "0 3px 16px rgba(0,0,0,0.9)", marginTop: 10 }}>
                {p.nome}
              </div>
            </div>
            {/* Valores nas bases das barras */}
            <div style={{ position: "absolute", left: p.cinza.x + p.cinza.w / 2, bottom: 18, transform: "translateX(-50%)", fontSize: 17, fontWeight: 700, color: "#FFF", whiteSpace: "nowrap", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              {p.vLanc}
            </div>
            <div style={{ position: "absolute", left: p.azul.x + p.azul.w / 2, bottom: 18, transform: "translateX(-50%)", fontSize: 17, fontWeight: 700, color: "#FFF", whiteSpace: "nowrap" }}>
              {p.vAtual}
            </div>
          </div>
        );
      })}

      {/* Rodapé discreto */}
      <div style={{ position: "absolute", left: 88, bottom: 22, fontSize: 14, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-mono)", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>
        Lançamento × valor atual · Projetos 2017–2024 · Vitacon
      </div>
    </div>
  );
}
