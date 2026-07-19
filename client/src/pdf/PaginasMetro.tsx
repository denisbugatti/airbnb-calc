/**
 * PaginasMetro.tsx — Linha 6-Laranja, a "linha das universidades".
 * Formato 1920×1080 · identidade Vitacon (preto #000 · azul #2800FF · branco).
 *
 * O diagrama é desenhado em código, e não a partir do print oficial: o material
 * do Metrô é branco e destoaria do deck. Estações já em operação aparecem com
 * o marcador preenchido; as previstas, vazadas.
 */

const CINZA = "#898A8E";
const LARANJA = "#F58220"; // cor oficial da Linha 6

type Estacao = { nome: string; operando?: boolean; universidade?: boolean; conexao?: string };

const ESTACOES: Estacao[] = [
  { nome: "Brasilândia" },
  { nome: "Maristela" },
  { nome: "Itaberaba-Hosp. V. Penteado" },
  { nome: "João Paulo I", operando: true },
  { nome: "Freguesia do Ó", operando: true },
  { nome: "Santa Marina", operando: true },
  { nome: "Água Branca", operando: true, conexao: "Linha 7" },
  { nome: "SESC-Pompeia", operando: true },
  { nome: "Perdizes", operando: true },
  { nome: "PUC-Cardoso de Almeida", universidade: true },
  { nome: "FAAP-Pacaembu", universidade: true },
  { nome: "Higienópolis-Mackenzie", universidade: true, conexao: "Linha 4" },
  { nome: "14 Bis-Saracura" },
  { nome: "Bela Vista" },
  { nome: "São Joaquim", conexao: "Linha 1" },
];

const METRO_STATS: { numero: string; label: string }[] = [
  { numero: "15", label: "Estações · todas subterrâneas" },
  { numero: "15,3 km", label: "De Brasilândia a São Joaquim" },
  { numero: "6", label: "Já em operação desde jul./2026" },
];

const X_INICIO = 108;
const X_FIM = 1812;
const Y_LINHA = 872;
// Rótulos escalonados em duas alturas: dobra o espaçamento efetivo por fileira.
// O ângulo é o que decide a colisão — a 62° cada rótulo ocupa L·cos(62°) ≈ 0,47·L
// na horizontal; com L máximo ~240px isso dá ~113px, abaixo dos ~122px de
// espaçamento entre estações. A 45° seriam ~170px e os nomes se encavalavam.
const ANGULO = 62;
// Distância do centro da linha até o TOPO do rótulo. Como a origem da rotação é
// a base do texto (0 100%), a âncora real fica ~26px abaixo destes valores — por
// isso os números precisam ser generosos para o nome não encostar no marcador,
// que tem raio 15.
const BAIXO = 84;
const ALTO = 216;

export function PaginaLinhaLaranja() {
  const passo = (X_FIM - X_INICIO) / (ESTACOES.length - 1);

  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", position: "relative", overflow: "hidden" }}>
      {/* Halo laranja atrás do trecho universitário */}
      <div style={{ position: "absolute", left: 1080, top: 420, width: 900, height: 760, background: "radial-gradient(circle, rgba(245,130,32,0.16) 0%, rgba(245,130,32,0) 68%)" }} />

      <div style={{ position: "absolute", top: 64, left: 88 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto" }} />
      </div>

      {/* Logo termina em y=104; o bloco começa em 162 para não encostar nele */}
      <div style={{ position: "absolute", left: 88, top: 162, maxWidth: 1400 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 3, background: LARANJA }} />
          <span style={{ fontSize: 19, letterSpacing: "0.3em", textTransform: "uppercase", color: LARANJA, fontFamily: "var(--font-mono)" }}>
            Metrô · Linha 6-Laranja
          </span>
        </div>

        <h1 style={{ margin: "24px 0 0", fontSize: 62, fontWeight: 300, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.1, letterSpacing: "0.005em" }}>
          A linha das<br />
          <span style={{ fontWeight: 800 }}>universidades.</span>
        </h1>

        <p style={{ margin: "24px 0 0", fontSize: 23, fontWeight: 300, color: CINZA, lineHeight: 1.5, maxWidth: 1320 }}>
          PUC, FAAP e Mackenzie ganham estação própria. Em Higienópolis-Mackenzie a
          linha encontra a <strong style={{ color: "#FFF", fontWeight: 600 }}>Linha 4-Amarela</strong> —
          e a estação seguinte é a <strong style={{ color: "#FFF", fontWeight: 600 }}>Paulista</strong>.
        </p>
      </div>

      {/* Traçado */}
      <div style={{ position: "absolute", left: X_INICIO, top: Y_LINHA - 5, width: X_FIM - X_INICIO, height: 10, background: "rgba(245,130,32,0.32)", borderRadius: 5 }} />
      <div style={{ position: "absolute", left: X_INICIO, top: Y_LINHA - 5, width: passo * 8, height: 10, background: LARANJA, borderRadius: 5 }} />

      {ESTACOES.map((e, i) => {
        const x = X_INICIO + passo * i;
        const destaque = e.universidade;
        const r = destaque ? 15 : 10;
        return (
          <div key={e.nome}>
            {/* Marcador */}
            <div style={{
              position: "absolute", left: x - r, top: Y_LINHA - r, width: r * 2, height: r * 2,
              borderRadius: "50%",
              background: destaque ? "#FFF" : e.operando ? LARANJA : "#000",
              border: destaque ? `4px solid ${LARANJA}` : e.operando ? "none" : `3px solid rgba(245,130,32,0.55)`,
            }} />
            {/* Haste até o rótulo alto (escalonamento par/ímpar) */}
            {i % 2 === 1 && (
              <div style={{ position: "absolute", left: x - 1, top: Y_LINHA - ALTO, width: 2, height: ALTO - 26, background: "rgba(255,255,255,0.18)" }} />
            )}
            {/* Nome, inclinado para caber */}
            <div style={{
              position: "absolute", left: x + 4, top: Y_LINHA - (i % 2 === 1 ? ALTO : BAIXO),
              transform: `rotate(-${ANGULO}deg)`, transformOrigin: "0 100%", whiteSpace: "nowrap",
              fontSize: destaque ? 17 : 15,
              fontWeight: destaque ? 700 : 400,
              color: destaque ? "#FFF" : e.operando ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.42)",
              fontFamily: destaque ? "var(--font-sans)" : "var(--font-mono)",
            }}>
              {e.nome}
              {e.conexao && (
                <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 400, color: LARANJA, fontFamily: "var(--font-mono)" }}>
                  ↳ {e.conexao}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Legenda + números */}
      <div style={{ position: "absolute", left: 88, bottom: 88, display: "flex", alignItems: "flex-end", gap: 46 }}>
        {METRO_STATS.map((s, i) => (
          <div key={s.label} style={{ paddingLeft: i === 0 ? 0 : 46, borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.2)" }}>
            <div style={{ fontSize: 46, fontWeight: 800, fontFamily: "var(--font-display)", lineHeight: 1, whiteSpace: "nowrap", color: i === 2 ? LARANJA : "#FFF" }}>
              {s.numero}
            </div>
            <div style={{ fontSize: 15, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginTop: 12, color: "rgba(255,255,255,0.55)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <p style={{ position: "absolute", right: 88, bottom: 92, margin: 0, fontSize: 15, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-mono)", textAlign: "right" }}>
        Fonte: Metrô de São Paulo · jul. 2026
      </p>
    </div>
  );
}
