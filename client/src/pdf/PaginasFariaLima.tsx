/**
 * PaginasFariaLima.tsx — geradores de demanda da região FARIA LIMA / ITAIM BIBI.
 * Formato 1920×1080 · identidade Vitacon (preto #000 · azul #2800FF · branco).
 *
 * 1. Fluxo (iPad)   — busca no Google renderizada em HTML: "Quantos executivos
 *                     passam por dia na Faria Lima?" → 145 mil (fonte: XP).
 * 2. Super JK       — hero do complexo Super JK.
 * 3. Itaim Bibi     — hero + título ITAIM BIBI.
 * 4. Empresas       — mural de logos (branco no preto, detalhe azul Vitacon).
 * 5. Cidade Jardim  — CJ Shops Faria Lima (JHSF), o shopping mais luxuoso do país.
 *
 * IMAGENS necessárias em client/public/pdf-assets/ (fornecidas pelo usuário):
 *   faria-lima.jpg (abertura) · faria-super-jk-1.jpg · faria-super-jk-2.jpg
 *   faria-itaim-bibi.jpg · faria-cidade-jardim.jpg
 *   emp-google.png · emp-apple.png · emp-meta.png · emp-bradesco.png
 *   emp-xp.png · emp-btg.png · emp-itau.png · emp-jpmorgan.png  (logos em BRANCO)
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

// ─── Ícones do Google (desenhados, sem dependência externa) ──────────────────
function IconMic() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z" fill="#4285F4" />
      <path d="M7 11a5 5 0 0 0 10 0" fill="none" stroke="#34A853" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 16v4" stroke="#FBBC05" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 20h6" stroke="#EA4335" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconLens() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="3" fill="#4285F4" />
      <path d="M5 8V6a1 1 0 0 1 1-1h2" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 5h2a1 1 0 0 1 1 1v2" fill="none" stroke="#FBBC05" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 16v2a1 1 0 0 1-1 1h-2" fill="none" stroke="#34A853" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 19H6a1 1 0 0 1-1-1v-2" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="7" fill="none" stroke="#4285F4" strokeWidth="2.2" />
      <path d="M16.5 16.5 21 21" stroke="#4285F4" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// ─── 1. Fluxo — iPad com busca no Google ─────────────────────────────────────
export function PaginaFariaLimaFluxo() {
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center" }}>
      {/* Grafismo V sutil */}
      <svg style={{ position: "absolute", left: -120, bottom: -140, width: 560, opacity: 0.14 }} viewBox="0 0 400 400" aria-hidden>
        <polygon points="120,0 200,0 320,300 400,300 400,400 260,400" fill={AZUL} />
      </svg>

      <div style={{ flex: 1, paddingLeft: 88, maxWidth: 760 }}>
        <Kicker>Fluxo da região</Kicker>
        <h1 style={{ margin: "30px 0 0", fontSize: 100, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.02 }}>
          <span style={{ color: AZUL }}>145 mil</span><br />executivos.<br />Todos os dias.
        </h1>
        <p style={{ margin: "34px 0 0", fontSize: 27, lineHeight: 1.5, color: CINZA, maxWidth: 640 }}>
          A Faria Lima é o principal centro financeiro da América Latina — um fluxo
          diário que sustenta a demanda por hospedagem, serviços e moradia de curta estadia.
        </p>
        <p style={{ margin: "40px 0 0", fontSize: 16, letterSpacing: "0.25em", textTransform: "uppercase", color: "#5C5C5C", fontFamily: "var(--font-mono)" }}>
          Fonte: XP Investimentos · conteudos.xpi.com.br
        </p>
      </div>

      {/* iPad com a busca do Google renderizada em HTML */}
      <div style={{
        width: 960, marginRight: 80, flexShrink: 0, background: "#1C1C1E",
        border: "3px solid #48484A", borderRadius: 46, padding: 22,
        boxShadow: "0 50px 120px rgba(40,0,255,0.25)", position: "relative",
      }}>
        {/* câmera frontal */}
        <div style={{ position: "absolute", top: 30, left: "50%", transform: "translateX(-50%)", width: 9, height: 9, borderRadius: "50%", background: "#3A3A3C" }} />
        <div style={{ background: "#FFFFFF", borderRadius: 24, overflow: "hidden", padding: "34px 40px 30px" }}>
          {/* barra de busca */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, border: "1px solid #DFE1E5", borderRadius: 999, padding: "16px 24px", boxShadow: "0 1px 4px rgba(32,33,36,0.12)" }}>
            <span style={{ flex: 1, fontSize: 24, color: "#202124", fontFamily: "Arial, sans-serif" }}>Quantos executivos passam por dia na Faria Lima?</span>
            <span style={{ fontSize: 22, color: "#70757a" }}>✕</span>
            <div style={{ width: 1, height: 28, background: "#DFE1E5" }} />
            <IconMic />
            <IconLens />
            <IconSearch />
          </div>

          {/* abas */}
          <div style={{ display: "flex", gap: 26, marginTop: 26, paddingBottom: 12, borderBottom: "1px solid #EBEBEB", fontFamily: "Arial, sans-serif" }}>
            <span style={{ fontSize: 17, color: "#1a73e8", fontWeight: 600, borderBottom: "3px solid #1a73e8", paddingBottom: 12, marginBottom: -13 }}>Todas</span>
            {["Notícias", "Imagens", "Vídeos", "Shopping", "Web", "Livros", "Mais"].map((t) => (
              <span key={t} style={{ fontSize: 17, color: "#5f6368" }}>{t}</span>
            ))}
          </div>

          {/* trecho em destaque */}
          <p style={{ margin: "34px 0 0", fontSize: 34, lineHeight: 1.4, color: "#202124", fontFamily: "Arial, sans-serif" }}>
            Todos os dias,{" "}
            <span style={{ background: "#d2e3fc", fontWeight: 700, borderRadius: 3, padding: "0 2px" }}>145 mil pessoas</span>{" "}
            circulam pela região da Faria Lima, em São Paulo.
          </p>

          {/* fonte */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 30 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#0f1e3d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#FFF", fontFamily: "Arial, sans-serif" }}>xp</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, color: "#202124", fontFamily: "Arial, sans-serif" }}>XP Investimentos</div>
              <div style={{ fontSize: 14, color: "#5f6368", fontFamily: "Arial, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                https://conteudos.xpi.com.br › relatorios › faria-lima-co...
              </div>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 20, color: "#5f6368" }}>⋮</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 24, color: "#1a0dab", fontFamily: "Arial, sans-serif" }}>
            Faria Lima: conheça mais sobre o principal centro financeiro ...
          </div>

          {/* rodapé */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 22, marginTop: 26, paddingTop: 16, borderTop: "1px solid #EBEBEB", fontSize: 14, color: "#70757a", fontFamily: "Arial, sans-serif" }}>
            <span>❓ Sobre trechos em destaque</span>
            <span>⚑ Feedback</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 0. Abertura Faria Lima — foto full-bleed + título centralizado ──────────
export function PaginaFariaLimaAbertura() {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000", fontFamily: "var(--font-sans)" }}>
      <img src="/pdf-assets/faria-lima.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* Vinheta para legibilidade do título central */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.2) 46%, rgba(0,0,0,0.7) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.58) 100%)" }} />

      {/* Logo topo, centralizado */}
      <div style={{ position: "absolute", top: 64, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto" }} />
      </div>

      {/* Bloco central */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 88px" }}>
        {/* Kicker centralizado, com traços simétricos */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
          <div style={{ width: 44, height: 3, background: AZUL }} />
          <span style={{ fontSize: 19, letterSpacing: "0.3em", textTransform: "uppercase", color: "#FFF", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
            Geradores de demanda
          </span>
          <div style={{ width: 44, height: 3, background: AZUL }} />
        </div>
        <h1 style={{ margin: 0, fontSize: 152, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1, letterSpacing: "0.02em" }}>
          FARIA LIMA
        </h1>
        <p style={{ margin: "32px 0 0", fontSize: 38, fontWeight: 300, color: "#FFF", maxWidth: 1100 }}>
          O principal centro financeiro da <span style={{ fontWeight: 600, borderBottom: `4px solid ${AZUL}` }}>América Latina</span>.
        </p>
      </div>
    </div>
  );
}

// ─── Página hero genérica (foto full-bleed + título) ─────────────────────────
function PaginaHero({ src, kicker, titulo, subtitulo, tags }: {
  src: string; kicker: string; titulo: React.ReactNode; subtitulo?: React.ReactNode; tags?: string[];
}) {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000", fontFamily: "var(--font-sans)" }}>
      <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.4) 48%, rgba(0,0,0,0.1) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 42%)" }} />

      <div style={{ position: "absolute", top: 64, left: 88, right: 88, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto" }} />
      </div>

      <div style={{ position: "absolute", left: 88, bottom: 96, maxWidth: 1200 }}>
        <Kicker>{kicker}</Kicker>
        <h1 style={{ margin: "26px 0 0", fontSize: 118, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1, letterSpacing: "0.005em" }}>
          {titulo}
        </h1>
        {subtitulo && (
          <p style={{ margin: "26px 0 0", fontSize: 40, fontWeight: 300, color: "#FFF", maxWidth: 900 }}>{subtitulo}</p>
        )}
        {tags && (
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            {tags.map((t) => (
              <span key={t} style={{ fontSize: 16, letterSpacing: "0.22em", textTransform: "uppercase", color: "#FFF", fontFamily: "var(--font-mono)", border: `1px solid ${AZUL}`, background: "rgba(40,0,255,0.18)", borderRadius: 6, padding: "9px 16px" }}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Página de foto full-bleed (sem legenda) ─────────────────────────────────
function PaginaFoto({ src }: { src: string }) {
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", overflow: "hidden" }}>
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

// ─── 2. Super JK — 2 páginas, foto de fundo, sem legenda ─────────────────────
export function PaginaSuperJK1() {
  return <PaginaFoto src="/pdf-assets/faria-super-jk-1.jpg" />;
}
export function PaginaSuperJK2() {
  return <PaginaFoto src="/pdf-assets/faria-super-jk-2.jpg" />;
}

// ─── 3. Itaim Bibi ───────────────────────────────────────────────────────────
export function PaginaItaimBibi() {
  return (
    <PaginaHero
      src="/pdf-assets/faria-itaim-bibi.jpg"
      kicker="Bairro nobre"
      titulo={<>ITAIM BIBI</>}
      subtitulo={<>Um dos metros quadrados mais valorizados de São Paulo.</>}
    />
  );
}

// ─── 5. CJ Shops Faria Lima — Cidade Jardim (JHSF) ──────────────────────────
// Sem título "CJ Shops": a frase vira a manchete + logo JHSF em branco.
export function PaginaCidadeJardim() {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000", fontFamily: "var(--font-sans)" }}>
      <img src="/pdf-assets/faria-cidade-jardim.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.42) 50%, rgba(0,0,0,0.12) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0) 46%)" }} />

      <div style={{ position: "absolute", top: 64, left: 88 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto" }} />
      </div>

      <div style={{ position: "absolute", left: 88, bottom: 96, maxWidth: 1280 }}>
        <Kicker>Alto luxo · JHSF</Kicker>
        <h1 style={{ margin: "28px 0 0", fontSize: 82, fontWeight: 300, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.12, letterSpacing: "0.005em", textShadow: "0 3px 22px rgba(0,0,0,0.5)" }}>
          O shopping mais luxuoso do Brasil,<br />
          <span style={{ fontWeight: 800 }}>mais uma nova unidade.</span>
        </h1>
        {/* Logo JHSF (branco) — fornecido pelo usuário, usado sem alteração */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 40 }}>
          <span style={{ fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-mono)" }}>Realização</span>
          <img src="/pdf-assets/jhsf-logo-branco.png" alt="JHSF" style={{ height: 46, width: "auto" }} />
        </div>
      </div>
    </div>
  );
}

// ─── 5b. CJ Shops Jardins (JHSF) — varejo de rua a céu aberto ───────────────
// Mesma família visual da unidade Cidade Jardim: foto full-bleed, manchete no
// canto inferior e assinatura "Realização · JHSF".
export function PaginaCjShopsJardins() {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000", fontFamily: "var(--font-sans)" }}>
      <img src="/pdf-assets/cj-shops-jardins.jpg" alt="" onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.42) 50%, rgba(0,0,0,0.12) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0) 46%)" }} />

      <div style={{ position: "absolute", top: 64, left: 88 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto" }} />
      </div>

      <div style={{ position: "absolute", left: 88, bottom: 96, maxWidth: 1180 }}>
        <Kicker>Jardins · Alto luxo</Kicker>
        <h1 style={{ margin: "28px 0 0", fontSize: 82, fontWeight: 300, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.12, letterSpacing: "0.005em", textShadow: "0 3px 22px rgba(0,0,0,0.5)" }}>
          O luxo saiu do shopping<br />
          <span style={{ fontWeight: 800 }}>e virou vizinhança.</span>
        </h1>
        <p style={{ margin: "26px 0 0", fontSize: 26, fontWeight: 300, color: "rgba(255,255,255,0.82)", lineHeight: 1.45, maxWidth: 760 }}>
          Boutiques, gastronomia e arte a céu aberto — jardim vertical, fachada
          em LED e curadoria JHSF no endereço mais desejado de São Paulo.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 40 }}>
          <span style={{ fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-mono)" }}>Realização</span>
          <img src="/pdf-assets/jhsf-logo-branco.png" alt="JHSF" style={{ height: 46, width: "auto" }} />
        </div>
      </div>
    </div>
  );
}

// ─── 4. Empresas na região — mural de logos ──────────────────────────────────
export function PaginaFariaLimaEmpresas() {
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* Detalhes azul Vitacon — brilhos nos cantos */}
      <div style={{ position: "absolute", top: -240, left: -160, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(40,0,255,0.28) 0%, rgba(40,0,255,0) 68%)" }} />
      <div style={{ position: "absolute", bottom: -300, left: -120, width: 640, height: 640, borderRadius: "50%", background: "radial-gradient(circle, rgba(40,0,255,0.18) 0%, rgba(40,0,255,0) 70%)" }} />

      {/* Título */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginBottom: 96 }}>
        <h1 style={{ margin: 0, fontSize: 84, fontWeight: 800, fontFamily: "var(--font-display)", color: "#FFF", letterSpacing: "0.01em" }}>
          Empresas na região <span style={{ color: AZUL }}>— Faria Lima</span>
        </h1>
        <div style={{ width: 90, height: 4, background: AZUL, margin: "28px auto 0" }} />
      </div>

      {/* Mural de logos — faixa única (Google, Apple, Meta, Bradesco, XP, BTG, Itaú, JPMorgan) */}
      <img
        src="/pdf-assets/emp-logos.png"
        alt="Google · Apple · Meta · Bradesco · XP Investimentos · BTG Pactual · Itaú · JPMorgan Chase"
        style={{ position: "relative", zIndex: 1, width: 1500, height: "auto", display: "block" }}
      />
    </div>
  );
}

// ─── 5. Rua Oscar Freire — a rua mais luxuosa do Brasil ──────────────────────
// Layout: foto de fundo dos Jardins + título + 3 métricas + card de busca.
// Identidade Vitacon (azul #2800FF / preto / branco).
const OSCAR_STATS: { numero: string; sup?: string; label: string }[] = [
  { numero: "+65%", label: "Valorização em 1 ano · Nº 1 do mundo" },
  { numero: "34", sup: "ª", label: "Rua comercial mais cara do planeta" },
  { numero: "5%", label: "De vacância · a menor do varejo de luxo" },
];

export function PaginaOscarFreire() {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000", fontFamily: "var(--font-sans)" }}>
      <img src="/pdf-assets/faria-oscar-freire.jpg" alt="Rua Oscar Freire · Jardins"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* Gradientes de legibilidade */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 34%, rgba(0,0,0,0.7) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 58%)" }} />

      <div style={{ position: "absolute", inset: 0, padding: "60px 88px", display: "flex", flexDirection: "column" }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 38, width: "auto", alignSelf: "flex-start" }} />
        <div style={{ marginTop: 28 }}>
          <Kicker>A 3 minutos a pé</Kicker>
        </div>
        <h1 style={{ margin: "20px 0 0", fontSize: 88, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1 }}>
          Rua Oscar Freire.
        </h1>
        <p style={{ margin: "18px 0 0", fontSize: 36, fontWeight: 300, color: "#FFF", maxWidth: 1120, lineHeight: 1.16 }}>
          A rua de luxo que <span style={{ fontWeight: 600, borderBottom: `4px solid ${AZUL}` }}>mais se valorizou</span> no mundo.
        </p>

        {/* 3 métricas */}
        <div style={{ display: "flex", gap: 22, marginTop: 40, maxWidth: 1400 }}>
          {OSCAR_STATS.map((s) => (
            <div key={s.label} style={{ flex: 1, background: "rgba(8,8,12,0.55)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 14, padding: "26px 30px" }}>
              <div style={{ fontSize: 58, fontWeight: 800, color: AZUL, fontFamily: "var(--font-display)", lineHeight: 1 }}>
                {s.numero}{s.sup && <span style={{ fontSize: 32 }}>{s.sup}</span>}
              </div>
              <div style={{ fontSize: 14.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)", fontFamily: "var(--font-mono)", marginTop: 14, lineHeight: 1.5 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Card de busca */}
        <div style={{ marginTop: "auto", alignSelf: "center", width: 860, background: "#FFF", borderRadius: 18, boxShadow: "0 40px 120px rgba(0,0,0,0.55)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 16px", background: "#ECECEC" }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F57" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEBC2E" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28C840" }} />
            <div style={{ flex: 1, marginLeft: 10, background: "#FFF", borderRadius: 999, padding: "6px 16px", fontSize: 14, color: "#5F6368", fontFamily: "var(--font-mono)" }}>
              google.com/search?q=rua+mais+luxuosa+do+brasil
            </div>
          </div>
          <div style={{ padding: "22px 32px 26px" }}>
            <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em" }}>
              <span style={{ color: "#4285F4" }}>G</span><span style={{ color: "#EA4335" }}>o</span><span style={{ color: "#FBBC05" }}>o</span><span style={{ color: "#4285F4" }}>g</span><span style={{ color: "#34A853" }}>l</span><span style={{ color: "#EA4335" }}>e</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid #DFE1E5", borderRadius: 999, padding: "11px 20px", marginTop: 12 }}>
              <span style={{ color: "#9AA0A6", fontSize: 17 }}>⌕</span>
              <span style={{ fontSize: 19, color: "#202124" }}>qual a rua mais luxuosa do brasil</span>
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 14, fontSize: 14, color: "#5F6368" }}>
              <span>Tudo</span>
              <span style={{ color: "#1A73E8", fontWeight: 600, borderBottom: "3px solid #1A73E8", paddingBottom: 7 }}>Notícias</span>
              <span>Imagens</span>
              <span>Maps</span>
            </div>
            <div style={{ height: 1, background: "#EBEBEB", margin: "0 0 18px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#000", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>F</span>
              <div>
                <div style={{ fontSize: 14, color: "#202124" }}>Forbes Brasil</div>
                <div style={{ fontSize: 12, color: "#5F6368" }}>forbes.com.br › notícias</div>
              </div>
            </div>
            <div style={{ fontSize: 21, color: "#1A0DAB", marginTop: 11, fontWeight: 500, lineHeight: 1.25 }}>
              Oscar Freire lidera valorização global das ruas de luxo, com alta de 65%
            </div>
            <div style={{ fontSize: 14.5, color: "#4D5156", marginTop: 7, lineHeight: 1.5 }}>
              Nos Jardins, em São Paulo, a via foi apontada como a rua de luxo que mais se valorizou no mundo no último ano.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 6. Hospital das Clínicas — o maior complexo hospitalar da AL ─────────────
const HC_STATS: { numero: string; label: string }[] = [
  { numero: "2.500", label: "Leitos" },
  { numero: "45.000", label: "Passantes diretos" },
  { numero: "21.600", label: "Profissionais" },
];

export function PaginaHospitalClinicas() {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000", fontFamily: "var(--font-sans)" }}>
      <img src="/pdf-assets/faria-hc.jpg" alt="Complexo do Hospital das Clínicas"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.8) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 100%)" }} />

      <div style={{ position: "absolute", inset: 0, padding: "64px 88px", display: "flex", justifyContent: "space-between" }}>
        {/* Coluna esquerda — título + card */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", maxWidth: 780 }}>
          <div>
            <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 38, width: "auto" }} />
            <div style={{ marginTop: 28 }}>
              <Kicker>Complexo hospitalar</Kicker>
            </div>
            <h1 style={{ margin: "22px 0 0", fontSize: 82, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.02, textShadow: "0 3px 22px rgba(0,0,0,0.6)" }}>
              Hospital das<br />Clínicas.
            </h1>
            <p style={{ margin: "20px 0 0", fontSize: 32, fontWeight: 300, color: "#FFF", maxWidth: 620, lineHeight: 1.2, textShadow: "0 2px 14px rgba(0,0,0,0.6)" }}>
              O maior complexo hospitalar da <span style={{ fontWeight: 600, borderBottom: `4px solid ${AZUL}` }}>América Latina</span>.
            </p>
          </div>

          {/* Card de busca (dado factual) */}
          <div style={{ width: 880, background: "#FFF", borderRadius: 20, boxShadow: "0 40px 120px rgba(0,0,0,0.55)", padding: "40px 48px" }}>
            <div style={{ fontSize: 26, color: "#202124", fontWeight: 500 }}>
              Quantas pessoas trabalham no Hospital das Clínicas?
            </div>
            <div style={{ fontSize: 22, color: "#4D5156", marginTop: 18, lineHeight: 1.55 }}>
              O complexo reúne cerca de <b style={{ color: "#202124" }}>21.600 profissionais</b> e realiza mais de 320 mil atendimentos de emergência por ano.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 24, fontSize: 17, color: "#5F6368" }}>
              <span style={{ width: 30, height: 30, borderRadius: "50%", background: "#0A5", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700 }}>S</span>
              Secretaria de Estado da Saúde de São Paulo
            </div>
          </div>
        </div>

        {/* Coluna direita — mapeamento demográfico */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 660, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginBottom: 44 }}>
            <span style={{ fontSize: 26, letterSpacing: "0.42em", textTransform: "uppercase", color: "#FFF", fontFamily: "var(--font-mono)", textAlign: "right", textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}>
              Mapeamento<br />demográfico
            </span>
            <div style={{ width: 72, height: 4, background: AZUL, marginTop: 20 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px 32px" }}>
            {HC_STATS.map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 78, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1, textShadow: "0 3px 22px rgba(0,0,0,0.75)" }}>{s.numero}</div>
                <div style={{ fontSize: 19, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-mono)", marginTop: 10, textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>{s.label}</div>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ fontSize: 27, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.15, textTransform: "uppercase", textShadow: "0 3px 18px rgba(0,0,0,0.75)" }}>
                Potencial de<br />alta ocupação
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 7. Albert Einstein — nova unidade / hospedagem oficial ──────────────────
export function PaginaAlbertEinstein() {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000", fontFamily: "var(--font-sans)" }}>
      <img src="/pdf-assets/faria-einstein.jpg" alt="Hospital Israelita Albert Einstein — nova unidade"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.35) 34%, rgba(0,0,0,0.96) 100%)" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "0 120px 84px", textAlign: "center" }}>
        {/* Kicker centralizado */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 26 }}>
          <div style={{ width: 48, height: 3, background: AZUL }} />
          <span style={{ fontSize: 20, letterSpacing: "0.4em", textTransform: "uppercase", color: "#FFF", fontFamily: "var(--font-mono)", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>Parceria exclusiva</span>
          <div style={{ width: 48, height: 3, background: AZUL }} />
        </div>
        {/* Logo Albert Einstein (branco) — fornecido pelo usuário, usado sem alteração */}
        <img src="/pdf-assets/einstein-logo-branco.png" alt="Hospital Israelita Albert Einstein"
          style={{ height: 150, width: "auto", marginBottom: 34, filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.55))" }} />
        <h1 style={{ margin: 0, maxWidth: 1500 }}>
          <span style={{ display: "block", fontSize: 32, fontWeight: 400, letterSpacing: "0.02em", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-sans)", textShadow: "0 2px 14px rgba(0,0,0,0.8)" }}>
            Hospedagem oficial do
          </span>
          <span style={{ display: "block", marginTop: 12, fontSize: 90, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.03, textShadow: "0 4px 30px rgba(0,0,0,0.7)" }}>
            melhor hospital da<br />América Latina.
          </span>
        </h1>
        <p style={{ margin: "26px 0 0", fontSize: 32, fontWeight: 300, color: "#FFF", textShadow: "0 2px 16px rgba(0,0,0,0.8)" }}>
          O hospital que atende celebridades, presidentes e bilionários.
        </p>
        <p style={{ margin: "28px 0 0", fontSize: 24, fontStyle: "italic", color: "rgba(255,255,255,0.78)", textShadow: "0 2px 14px rgba(0,0,0,0.8)" }}>
          O hóspede não escolhe a data. A saúde escolhe por ele.
        </p>
      </div>
    </div>
  );
}

// ─── 7b. Sírio-Libanês — nova unidade no Brooklin (complexo O Parque) ────────
// Foto full-bleed + manchete no canto inferior, com a assinatura do hospital.
const SIRIO_STATS: { numero: string; label: string }[] = [
  { numero: "10 mil m²", label: "Nova unidade" },
  { numero: "9 andares", label: "Da Torre Orvalho" },
  { numero: "2027", label: "Início da operação" },
];

export function PaginaSirioBrooklin() {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000", fontFamily: "var(--font-sans)" }}>
      <img src="/pdf-assets/sirio-o-parque.jpg" alt="Complexo O Parque, no Brooklin, onde fica a Torre Orvalho"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.78) 24%, rgba(0,0,0,0.5) 46%, rgba(0,0,0,0.24) 70%, rgba(0,0,0,0.1) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 22%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0) 60%)" }} />

      <div style={{ position: "absolute", top: 64, left: 88 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto" }} />
      </div>

      <div style={{ position: "absolute", left: 88, bottom: 92, maxWidth: 1120 }}>
        <Kicker corTexto="rgba(255,255,255,0.88)">Brooklin · Complexo O Parque</Kicker>

        <h1 style={{ margin: "26px 0 0", fontSize: 76, fontWeight: 300, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.1, letterSpacing: "0.005em", textShadow: "0 3px 22px rgba(0,0,0,0.55)" }}>
          O Sírio-Libanês<br />
          <span style={{ fontWeight: 800 }}>chega ao Brooklin.</span>
        </h1>

        <p style={{ margin: "26px 0 0", fontSize: 24, fontWeight: 300, color: "rgba(255,255,255,0.78)", lineHeight: 1.5, maxWidth: 760 }}>
          Hospital-dia com pronto-socorro, centro diagnóstico e centro cirúrgico na
          Torre Orvalho. Paciente, acompanhante e corpo clínico não escolhem a data —
          e precisam ficar perto por poucas noites.
        </p>

        <div style={{ display: "flex", gap: 46, marginTop: 44 }}>
          {SIRIO_STATS.map((s, i) => (
            <div key={s.label} style={{ paddingLeft: i === 0 ? 0 : 46, borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: 46, fontWeight: 800, fontFamily: "var(--font-display)", lineHeight: 1, whiteSpace: "nowrap", color: i === 0 ? "#FFF" : "rgba(255,255,255,0.5)" }}>
                {s.numero}
              </div>
              <div style={{ fontSize: 15, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginTop: 12, color: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <p style={{ margin: "36px 0 0", fontSize: 15, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-mono)" }}>
          Fontes: Bloomberg Línea · CBRE · Forbes
        </p>
      </div>

      {/* Assinatura do hospital — logo sem fundo, direto sobre a foto */}
      <div style={{ position: "absolute", right: 88, bottom: 100, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 22 }}>
        <span style={{ fontSize: 14, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-mono)", textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}>Em obras</span>
        {/* SVG vetorial fornecido pelo hospital — sem fundo e nítido em qualquer escala */}
        <img src="/pdf-assets/sirio-logo.svg" alt="Hospital Sírio-Libanês"
          style={{ width: 640, height: "auto", display: "block", filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.85))" }} />
      </div>
    </div>
  );
}

// ─── 7c. Berrini × Chucri Zaidan — eixo corporativo da zona sul ──────────────
// A foto é panorâmica (~3:1). Em vez de `cover` — que cortaria 41% da largura e
// perderia a fileira de torres — ela entra como faixa ancorada na base.
const BERRINI_STATS: { numero: string; label: string }[] = [
  { numero: "12,25%", label: "Vacância na Chucri Zaidan" },
  { numero: "R$ 118/m²", label: "Aluguel pedido · Chucri" },
  { numero: "R$ 98/m²", label: "Aluguel pedido · Berrini" },
];

export function PaginaBerriniChucri() {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000", fontFamily: "var(--font-sans)" }}>
      <img src="/pdf-assets/berrini-chucri-zaidan.jpg" alt="Torres corporativas do eixo Berrini / Chucri Zaidan"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 42%", display: "block" }} />
      {/* Overlay leve: as torres precisam aparecer */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.7) 26%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.16) 74%, rgba(0,0,0,0.04) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 22%, rgba(0,0,0,0.18) 42%, rgba(0,0,0,0) 60%)" }} />

      <div style={{ position: "absolute", top: 64, left: 88 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto" }} />
      </div>

      <div style={{ position: "absolute", left: 88, bottom: 92, maxWidth: 1100 }}>
        <Kicker corTexto="rgba(255,255,255,0.88)">Berrini × Chucri Zaidan</Kicker>

        <h1 style={{ margin: "26px 0 0", fontSize: 72, fontWeight: 300, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.1, letterSpacing: "0.005em", textShadow: "0 3px 22px rgba(0,0,0,0.55)" }}>
          O eixo corporativo<br />
          <span style={{ fontWeight: 800 }}>da zona sul.</span>
        </h1>

        <p style={{ margin: "26px 0 0", fontSize: 23, fontWeight: 300, color: "rgba(255,255,255,0.78)", lineHeight: 1.5, maxWidth: 800 }}>
          Com metro quadrado abaixo da Faria Lima, a Chucri Zaidan puxou grandes empresas
          para a região: a vacância caiu de 26,7% em 2024 para 12,25%. Ao lado, a Berrini
          consolida o corredor.
        </p>

        <div style={{ display: "flex", gap: 46, marginTop: 44 }}>
          {BERRINI_STATS.map((s, i) => (
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
          Fontes: Buildings · Status Invest · jun. 2026
        </p>
      </div>
    </div>
  );
}

// ─── 8. Shops Faria Lima — novo shopping de ultra luxo (a torre) ─────────────
export function PaginaShopsFariaLima() {
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", display: "flex", overflow: "hidden" }}>
      {/* Coluna de texto */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px 0 88px", position: "relative" }}>
        <div style={{ position: "absolute", top: 90, left: -140, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(40,0,255,0.22) 0%, rgba(40,0,255,0) 70%)" }} />
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto", alignSelf: "flex-start", position: "relative", zIndex: 1 }} />
        <div style={{ marginTop: 32, position: "relative", zIndex: 1 }}>
          <Kicker>Em breve · Ultra luxo</Kicker>
        </div>
        <h1 style={{ margin: "22px 0 0", fontSize: 88, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.02, position: "relative", zIndex: 1 }}>
          Shops<br />Faria Lima.
        </h1>
        <p style={{ margin: "22px 0 0", fontSize: 34, fontWeight: 300, color: "#FFF", maxWidth: 720, lineHeight: 1.2, position: "relative", zIndex: 1 }}>
          Ao lado do nosso prédio surge um novo <span style={{ fontWeight: 600, borderBottom: `4px solid ${AZUL}` }}>shopping de ultra luxo</span>.
        </p>
        <p style={{ margin: "28px 0 0", fontSize: 22, lineHeight: 1.55, color: CINZA, maxWidth: 720, position: "relative", zIndex: 1 }}>
          No coração do centro financeiro de São Paulo, reunirá restaurantes, cinema, academia e uma curadoria das marcas mais desejadas do mundo — com arquitetura e paisagismo assinados por nomes de referência.
        </p>
        <p style={{ margin: "34px 0 0", fontSize: 16, letterSpacing: "0.25em", textTransform: "uppercase", color: AZUL, fontFamily: "var(--font-mono)", position: "relative", zIndex: 1 }}>
          Av. Brigadeiro Faria Lima, 3477
        </p>
        {/* Logo JHSF (branco) — fornecido pelo usuário, usado sem alteração */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 34, position: "relative", zIndex: 1 }}>
          <span style={{ fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase", color: CINZA, fontFamily: "var(--font-mono)" }}>Realização</span>
          <img src="/pdf-assets/jhsf-logo-branco.png" alt="JHSF" style={{ height: 36, width: "auto" }} />
        </div>
      </div>
      {/* Torre */}
      <div style={{ width: 760, flexShrink: 0, position: "relative" }}>
        <img src="/pdf-assets/faria-shops-torre.jpg" alt="Shops Faria Lima" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #000 0%, rgba(0,0,0,0) 22%)" }} />
      </div>
    </div>
  );
}

// ─── 9. Instituições de ensino de elite (Link / Insper) ──────────────────────
// Layout: coluna de texto (preto) + fachada à direita. Deixa claro que esses
// potenciais clientes de alto padrão passam na porta do empreendimento.
function PaginaEnsino({ src, kicker, nome, descricao, stats, frase }: {
  src: string; kicker: string; nome: React.ReactNode; descricao: React.ReactNode;
  stats: { numero: string; label: string }[]; frase: React.ReactNode;
}) {
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", position: "relative", overflow: "hidden" }}>
      {/* Fachada em plano de fundo completo */}
      <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      {/* Escurece a esquerda para o texto respirar; libera a foto à direita */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.84) 20%, rgba(0,0,0,0.72) 36%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.38) 64%, rgba(0,0,0,0.24) 80%, rgba(0,0,0,0.16) 100%)" }} />
      {/* Vinheta vertical de arremate */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.12) 22%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.16) 72%, rgba(0,0,0,0.46) 100%)" }} />

      {/* Texto */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px 0 88px" }}>
        <div style={{ position: "absolute", top: 100, left: -140, width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle, rgba(40,0,255,0.2) 0%, rgba(40,0,255,0) 70%)" }} />
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto", alignSelf: "flex-start", position: "relative", zIndex: 1 }} />
        <div style={{ marginTop: 32, position: "relative", zIndex: 1 }}>
          <Kicker>{kicker}</Kicker>
        </div>
        <h1 style={{ margin: "22px 0 0", fontSize: 84, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.02, position: "relative", zIndex: 1 }}>
          {nome}
        </h1>
        <p style={{ margin: "20px 0 0", fontSize: 32, fontWeight: 300, color: "#FFF", maxWidth: 720, lineHeight: 1.22, position: "relative", zIndex: 1 }}>
          {descricao}
        </p>

        {/* Números */}
        <div style={{ display: "flex", gap: 56, marginTop: 44, position: "relative", zIndex: 1 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ paddingLeft: i === 0 ? 0 : 56, borderLeft: i === 0 ? "none" : "1px solid #2A2A2A" }}>
              <div style={{ fontSize: 68, fontWeight: 800, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1 }}>{s.numero}</div>
              <div style={{ fontSize: 16, letterSpacing: "0.16em", textTransform: "uppercase", color: CINZA, fontFamily: "var(--font-mono)", marginTop: 12 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Frase de arremate */}
        <div style={{ marginTop: 44, borderLeft: `5px solid ${AZUL}`, background: "rgba(40,0,255,0.28)", backdropFilter: "blur(2px)", padding: "20px 26px", maxWidth: 720, position: "relative", zIndex: 1 }}>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 500, color: "#FFF", lineHeight: 1.4 }}>{frase}</p>
        </div>
      </div>
    </div>
  );
}

export function PaginaLink() {
  return (
    <PaginaEnsino
      src="/pdf-assets/faria-link.jpg"
      kicker="Universidade dos bilionários"
      nome={<>Link School.</>}
      descricao={<>A universidade de empreendedorismo mais exclusiva de São Paulo.</>}
      stats={[
        { numero: "1.200", label: "Alunos" },
        { numero: "R$ 30 mil", label: "Mensalidade / mês" },
      ]}
      frase={<>Potenciais clientes de altíssimo padrão na porta do seu empreendimento, todos os dias.</>}
    />
  );
}

export function PaginaInsper() {
  return (
    <PaginaEnsino
      src="/pdf-assets/faria-insper.jpg"
      kicker="Educação executiva"
      nome={<>Insper.</>}
      descricao={<>O melhor centro de treinamento executivo do Brasil.</>}
      stats={[
        { numero: "13 mil", label: "Alunos" },
        { numero: "R$ 80 mil", label: "MBA de 3 dias" },
      ]}
      frase={<>Executivos e empresários passam pela porta do seu empreendimento, todos os dias.</>}
    />
  );
}

// ─── 10. Avenida Rebouças — a "nova Faria Lima" ──────────────────────────────
const REBOUCAS_STATS: { big: string; suf: string; label: React.ReactNode }[] = [
  { big: "+66", suf: "%", label: <>m² de venda em 5 anos · vs +28% da média SP</> },
  { big: "+132", suf: "%", label: <>Valorização do m² de locação no período</> },
  { big: "2", suf: "ª", label: <>Região corporativa mais cara de SP · acima de R$ 200/m²</> },
];
const REBOUCAS_EMPRESAS = "Amazon · Netflix · Nubank · Safra · Stone · Avenue (Itaú)";

export function PaginaReboucas() {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #06060F 0%, #000 58%)", fontFamily: "var(--font-sans)" }}>
      <img src="/pdf-assets/faria-reboucas.jpg" alt="" onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* Overlay leve: o skyline precisa aparecer */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.76) 24%, rgba(0,0,0,0.48) 46%, rgba(0,0,0,0.22) 70%, rgba(0,0,0,0.08) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.62) 22%, rgba(0,0,0,0.22) 40%, rgba(0,0,0,0) 60%)" }} />

      <div style={{ position: "absolute", top: 64, left: 88 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto" }} />
      </div>

      <div style={{ position: "absolute", left: 88, bottom: 92, maxWidth: 1120 }}>
        <Kicker corTexto="rgba(255,255,255,0.88)">A 6 minutos a pé</Kicker>

        <h1 style={{ margin: "26px 0 0", fontSize: 76, fontWeight: 300, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.1, letterSpacing: "0.005em", textShadow: "0 3px 22px rgba(0,0,0,0.55)" }}>
          Avenida Rebouças.<br />
          <span style={{ fontWeight: 800 }}>A “nova Faria Lima”.</span>
        </h1>

        <p style={{ margin: "26px 0 0", fontSize: 24, fontWeight: 300, color: "rgba(255,255,255,0.78)", lineHeight: 1.5, maxWidth: 720 }}>
          {REBOUCAS_EMPRESAS} — todos já estão na região.
        </p>

        <div style={{ display: "flex", gap: 46, marginTop: 44 }}>
          {REBOUCAS_STATS.map((s, i) => (
            <div key={i} style={{ paddingLeft: i === 0 ? 0 : 46, borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.2)", maxWidth: 300 }}>
              <div style={{ fontSize: 46, fontWeight: 800, color: i === 0 ? "#FFF" : "rgba(255,255,255,0.5)", fontFamily: "var(--font-display)", lineHeight: 1, whiteSpace: "nowrap" }}>
                {s.big}<span style={{ fontSize: 26 }}>{s.suf}</span>
              </div>
              <div style={{ fontSize: 15, letterSpacing: "0.16em", textTransform: "uppercase", color: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)", fontFamily: "var(--font-mono)", marginTop: 12, lineHeight: 1.45 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <p style={{ margin: "36px 0 0", fontSize: 15, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-mono)" }}>
          Fontes: Datazap/Exame · CBRE · JLL
        </p>
      </div>
    </div>
  );
}

// ─── 7d. Faria Lima — mais helipontos do que pontos de ônibus ────────────────
// A foto é retrato (896×1200, proporção 0,75) e o painel da direita é 800×1080
// (0,74) — praticamente a mesma proporção, então entra sem corte perceptível.
const HELI_STATS: { numero: string; label: string }[] = [
  { numero: "+175", label: "Helipontos cadastrados na ANAC em SP" },
  { numero: "1ª", label: "Rede mais densa do mundo" },
];

export function PaginaHelipontos() {
  return (
    <div style={{ width: 1920, height: 1080, background: "#000", fontFamily: "var(--font-sans)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center" }}>
      <svg style={{ position: "absolute", left: -120, bottom: -140, width: 560, opacity: 0.12 }} viewBox="0 0 400 400" aria-hidden>
        <polygon points="120,0 200,0 320,300 400,300 400,400 260,400" fill={AZUL} />
      </svg>

      <div style={{ flex: 1, paddingLeft: 88, maxWidth: 1060, position: "relative", zIndex: 1 }}>
        <img src="/vitacon-logo.png" alt="Vitacon" style={{ height: 40, width: "auto", display: "block", marginBottom: 48 }} />
        <Kicker>Faria Lima · Do alto</Kicker>

        <h1 style={{ margin: "32px 0 0", fontSize: 64, fontWeight: 300, color: "#FFF", fontFamily: "var(--font-display)", lineHeight: 1.1, whiteSpace: "nowrap" }}>
          Mais helipontos<br />
          <span style={{ fontWeight: 800 }}>do que pontos de ônibus.</span>
        </h1>

        <p style={{ margin: "32px 0 0", fontSize: 23, fontWeight: 300, color: CINZA, lineHeight: 1.55, maxWidth: 700 }}>
          São Paulo tem a rede de helipontos mais densa do mundo — e a maior parte dela
          está concentrada aqui. O executivo chega pelo alto, resolve o dia e volta.
        </p>

        <div style={{ display: "flex", gap: 44, marginTop: 56 }}>
          {HELI_STATS.map((s, i) => (
            <div key={s.label} style={{ paddingLeft: i === 0 ? 0 : 44, borderLeft: i === 0 ? "none" : "1px solid #2A2A2A", maxWidth: 300 }}>
              <div style={{ fontSize: 46, fontWeight: 800, fontFamily: "var(--font-display)", lineHeight: 1, whiteSpace: "nowrap", color: i === 0 ? "#FFF" : "rgba(255,255,255,0.5)" }}>
                {s.numero}
              </div>
              <div style={{ fontSize: 15, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginTop: 12, lineHeight: 1.45, color: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <p style={{ margin: "48px 0 0", fontSize: 15, letterSpacing: "0.25em", textTransform: "uppercase", color: "#5C5C5C", fontFamily: "var(--font-mono)" }}>
          Fontes: ANAC · Aerojota
        </p>
      </div>

      {/* Painel retrato com a torre e o helicóptero */}
      <div style={{ width: 800, height: 1080, marginLeft: "auto", flexShrink: 0, position: "relative" }}>
        <img src="/pdf-assets/faria-heliponto.jpg" alt="Torre corporativa na Faria Lima com helicóptero em aproximação"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    </div>
  );
}
