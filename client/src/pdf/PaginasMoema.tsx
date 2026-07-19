/**
 * PaginasMoema.tsx — geradores de demanda da região MOEMA / CONGONHAS.
 * Formato 1920×1080 · identidade Vitacon (preto #000 · azul #2800FF · branco).
 *
 * 1. IDH Moema  — 0,961: card de busca em celular + comparativo Moema/Noruega/Brasil
 * 2. Congonhas  — 1,9 milhão de passageiros/mês + investimento de R$ 2 bi até 2028
 */

const AZUL = "#2800FF";
const CINZA = "#898A8E";

// Sobre foto, o azul #2800FF não tem contraste suficiente: `corTexto` permite
// manter a barra azul como acento e subir o texto para branco.
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

// ─── 1. IDH de Moema — 0,961 ─────────────────────────────────────────────────
// Foto do Ibirapuera full-bleed + manchete no canto inferior, seguindo o mesmo
// formato das outras páginas de foto do deck (CJ Shops, Cidade Jardim).
// A manchete carrega a comparação com a Noruega; o número entra na régua de
// apoio, não como métrica gigante.
const IDH_COMPARATIVO: { valor: string; label: string; destaque?: boolean }[] = [
  { valor: "0,961", label: "Moema", destaque: true },
  { valor: "0,944", label: "Noruega — 1º do mundo" },
  { valor: "0,744", label: "Brasil" },
];

export function PaginaIdhMoema() {
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", position: "relative", overflow: "hidden" }}>
      {/* Foto do Ibirapuera em plano de fundo */}
      <img src="/pdf-assets/moema-ibirapuera.jpg" alt="" onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* Legibilidade: escurece a esquerda e a base, libera o verde do parque */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.84) 24%, rgba(0,0,0,0.62) 44%, rgba(0,0,0,0.34) 66%, rgba(0,0,0,0.18) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 26%, rgba(0,0,0,0) 52%)" }} />

      <div style={{ position: "absolute", top: 64, left: 88 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto" }} />
      </div>

      <div style={{ position: "absolute", left: 88, bottom: 92, maxWidth: 1120 }}>
        <Kicker corTexto="rgba(255,255,255,0.88)">Moema · Índice de desenvolvimento humano</Kicker>

        <h1 style={{ margin: "26px 0 0", fontSize: 76, fontWeight: 300, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.1, letterSpacing: "0.005em", textShadow: "0 3px 22px rgba(0,0,0,0.5)" }}>
          Moema vive melhor<br />
          <span style={{ fontWeight: 800 }}>que a Noruega.</span>
        </h1>

        <p style={{ margin: "26px 0 0", fontSize: 24, fontWeight: 300, color: "rgba(255,255,255,0.78)", lineHeight: 1.5, maxWidth: 700 }}>
          Renda, longevidade e educação no topo da escala. O bairro supera o país
          com o maior IDH do mundo, e é vizinho do Ibirapuera.
        </p>

        {/* Régua de apoio: o número sustenta a manchete, não compete com ela */}
        <div style={{ display: "flex", gap: 46, marginTop: 44 }}>
          {IDH_COMPARATIVO.map((item, i) => (
            <div key={item.label} style={{ paddingLeft: i === 0 ? 0 : 46, borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: 46, fontWeight: 800, fontFamily: "var(--font-display)", lineHeight: 1, color: item.destaque ? "#FFF" : "rgba(255,255,255,0.5)" }}>
                {item.valor}
              </div>
              <div style={{ fontSize: 15, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginTop: 12, color: item.destaque ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)" }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        <p style={{ margin: "36px 0 0", fontSize: 15, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-mono)" }}>
          Fonte: Atlas do Desenvolvimento Humano no Brasil · PNUD
        </p>
      </div>
    </div>
  );
}

// ─── 2. Aeroporto de Congonhas — o hub que conecta o Brasil ──────────────────
// Foto full-bleed + manchete no canto inferior, no mesmo formato da página de
// Moema e das demais páginas de foto. O 1,9 milhão entra na régua de apoio.
const CGH_STATS: { numero: string; label: string; destaque?: boolean }[] = [
  { numero: "1,9 mi", label: "Passageiros por mês", destaque: true },
  { numero: "500", label: "Voos por dia" },
  { numero: "R$ 2 bi", label: "Investimento até 2028" },
];

export function PaginaCongonhas() {
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", position: "relative", overflow: "hidden" }}>
      <img src="/pdf-assets/congonhas.jpg" alt="" onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* Legibilidade: escurece a esquerda e a base, libera a pista à direita */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.84) 24%, rgba(0,0,0,0.62) 44%, rgba(0,0,0,0.34) 66%, rgba(0,0,0,0.18) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 26%, rgba(0,0,0,0) 52%)" }} />

      <div style={{ position: "absolute", top: 64, left: 88 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto" }} />
      </div>

      <div style={{ position: "absolute", left: 88, bottom: 92, maxWidth: 1120 }}>
        <Kicker corTexto="rgba(255,255,255,0.88)">Aeroporto de Congonhas</Kicker>

        <h1 style={{ margin: "26px 0 0", fontSize: 76, fontWeight: 300, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.1, letterSpacing: "0.005em", textShadow: "0 3px 22px rgba(0,0,0,0.5)" }}>
          O Brasil inteiro<br />
          <span style={{ fontWeight: 800 }}>passa por aqui.</span>
        </h1>

        <p style={{ margin: "26px 0 0", fontSize: 24, fontWeight: 300, color: "rgba(255,255,255,0.78)", lineHeight: 1.5, maxWidth: 700 }}>
          Segundo maior aeroporto do país e principal hub doméstico. A poucos minutos
          da porta: executivos, turistas e viajantes frequentes — o ano inteiro.
        </p>

        {/* Régua de apoio: os números sustentam a manchete, não competem com ela */}
        <div style={{ display: "flex", gap: 46, marginTop: 44 }}>
          {CGH_STATS.map((s, i) => (
            <div key={s.label} style={{ paddingLeft: i === 0 ? 0 : 46, borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: 46, fontWeight: 800, fontFamily: "var(--font-display)", lineHeight: 1, whiteSpace: "nowrap", color: s.destaque ? "#FFF" : "rgba(255,255,255,0.5)" }}>
                {s.numero}
              </div>
              <div style={{ fontSize: 15, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginTop: 12, color: s.destaque ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <p style={{ margin: "36px 0 0", fontSize: 15, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-mono)" }}>
          Fonte: Infraero · Aena Brasil
        </p>
      </div>
    </div>
  );
}
