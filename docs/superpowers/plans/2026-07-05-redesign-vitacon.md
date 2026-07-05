# Redesign Vitacon + Correção do Cálculo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir o motor de cálculo (base do ROI = capital próprio total + decoração, impostos editáveis) e aplicar o design system Vitacon (ITC Avant Garde Gothic, azul #2800FF, 2 temas, splash full screen) mantendo Fluxo, cenários, share link e export PNG.

**Architecture:** O app é React 19 + Vite 7 + Tailwind v4 (tokens shadcn em CSS vars no `index.css`, tema via classe `.dark`). As duas páginas (`Home.tsx`, `Fluxo.tsx`) roteiam ~90% das cores por uma função local `useColors(isDark)` — substituí-la por um módulo compartilhado com a paleta Vitacon reskina quase tudo de uma vez. O motor de cálculo é puro em `calculator.ts`; a correção acontece lá e os consumidores leem os novos campos.

**Tech Stack:** React 19, Vite 7, Tailwind v4, TypeScript, vitest (já em devDependencies), framer-motion (reduzir uso), html-to-image, wouter.

**Spec:** `docs/superpowers/specs/2026-07-05-calculadora-rentabilidade-redesign-design.md`

**Working dir:** `/Users/bugateira/Code/airbnb-calc`, branch `redesign-vitacon`.

---

## Fatos do código atual (levantados na auditoria)

- `client/src/lib/calculator.ts` — motor puro. `pmt()` correto (Price). Bugs: `totalUnidade` ignora mobília; retornos usam `capitalProprio` cru; impostos hardcoded `0.91`/`0.73`.
- `client/src/pages/Home.tsx:441-448` — `inputsComFluxo` monta `capitalProprio` com toggle `incluiDecoracao` (deve passar a ser incondicional, e a soma da mobília migra para dentro do motor).
- `client/src/pages/Home.tsx:923` — breakeven do investimento já soma mobília por fora (`totalInv + calc.mobilia`) → passa a ler `results.capitalProprioTotal`.
- `client/src/pages/Home.tsx:61-105` — `useColors(isDark)` local; `Fluxo.tsx:35` tem outra cópia. Chaves: surface, surfaceHover, border, borderFocus, inputBg, inputBgFocus, text1-4, blue/green/amber/red (+Glow/Border/Bg/IconBg), divider, cardShadow(+Hover), inputShadow, focusShadow, mono.
- `client/src/pages/Home.tsx:372-385` — `GlassPanel` com `motion.div initial={{opacity:0}}` (causa página preta em scroll/screenshot).
- `client/src/App.tsx` — NavBar "Short Stay" (logo manus-storage quebrado), `GlobalBackground` com cursor-glow/noise, fonte Geist.
- `client/src/components/QuadroRentabilidade.tsx` — logo `/manus-storage/airbnb-logo_a915ef9c.webp` (quebrado), prop `incluiDecoracao`, `totalInvestido = inputs.capitalProprio`.
- `client/index.html` — favicon/og apontando para manus-storage.
- Fontes OTF em `/Users/bugateira/Desktop/VITACON/ITC Avant Garde Gothic/` (17-26 KB cada — servir direto, sem converter p/ woff2: YAGNI).
- Logo Vitacon: `/Users/bugateira/vitacon-design-system/assets/vitacon-logo.svg` (viewBox 0 0 360 84, `fill="currentColor"`).
- Animação do logo: `/Users/bugateira/vitacon-logo/index.html` (SVG + keyframes CSS, loop 5s — adaptar para single-run).
- vitest ^2.1.4 já instalado; falta script `"test"`.
- `incluiDecoracao` continua existindo APENAS para o export do Fluxo (`Fluxo.tsx:703-721`) — sai do caminho do cálculo.

## Valores de verificação (gabarito para testes)

Cenário do site atual: diária 650 × 23 dias; condominio 700, iptu 290, wifi 120, agua 80, luz 150; adminSeguro 15%, plataforma 3%, limpeza 120×4, gestão 0; saldo 383.424 @ 1% a.m. × 360m; fluxo pagou 93.576; mobília 40.000.

- receitaBruta = **14.950**
- parcela = PMT(0.01, 360, 383424) ≈ **3.944,18**
- totalDespesas ≈ **8.455,18**
- rendaLiquida ≈ **6.494,82**
- capitalProprioTotal = 93.576 + 40.000 = **133.576**
- retornoCapitalAM = 6.494,82/133.576×100 ≈ **4,862%** → AA ≈ **58,34%**
- patrimonioTotal = 477.000 + 40.000 = **517.000**; retornoPatrimonioAM ≈ **1,256%**
- PMT(0.009, 360, 197000) ≈ **1.846,35** (verificação isolada da função pmt, caso planilha NILSON)

---

### Task 1: Motor de cálculo v2 (TDD)

**Files:**
- Modify: `client/src/lib/calculator.ts`
- Create: `client/src/lib/calculator.test.ts`
- Modify: `package.json` (script test)
- Modify: `client/src/pages/Home.tsx:441-448` e `:923`

- [ ] **Step 1: Adicionar script de teste**

Em `package.json`, dentro de `"scripts"`, adicionar após `"check"`:

```json
    "test": "vitest run",
```

- [ ] **Step 2: Escrever os testes que falham**

Criar `client/src/lib/calculator.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { calcular, pmt, defaultInputs, type CalculatorInputs } from "./calculator";

const cenarioAtual: CalculatorInputs = {
  areaM2: 29, valorImovel: 477_000, mobilia: 40_000,
  diaria: 650, diasOcupacao: 23,
  capitalProprio: 93_576, saldoFinanciar: 383_424,
  taxaJurosMensal: 0.01, prazoMeses: 360,
  condominio: 700, iptuMensal: 290, wifi: 120, agua: 80, luz: 150,
  taxaAdminSeguro: 0.15, taxaPlataforma: 0.03,
  custoLimpeza: 120, checkInsMes: 4, taxaGestao: 0,
  impostoHolding: 0.09, impostoPF: 0.27,
};

describe("pmt (Price / PGTO)", () => {
  it("bate com o PGTO da planilha NILSON (0,9% a.m., 360m, 197k)", () => {
    expect(pmt(0.009, 360, 197_000)).toBeCloseTo(1846.35, 0);
  });
  it("saldo zero → parcela zero", () => {
    expect(pmt(0.01, 360, 0)).toBe(0);
  });
  it("taxa zero → amortização linear", () => {
    expect(pmt(0, 100, 1000)).toBe(10);
  });
});

describe("calcular — cenário de referência", () => {
  const r = calcular(cenarioAtual);
  it("receita bruta = diária × dias", () => {
    expect(r.receitaBrutaMensal).toBe(14_950);
  });
  it("parcela do financiamento (Price 1% × 360 sobre 383.424)", () => {
    expect(r.parcelaFinanciamento).toBeCloseTo(3944.18, 0);
  });
  it("total de despesas", () => {
    expect(r.totalDespesas).toBeCloseTo(8455.18, 0);
  });
  it("renda líquida", () => {
    expect(r.rendaMensalLiquida).toBeCloseTo(6494.82, 0);
  });
  it("CORREÇÃO: base do ROI = capital próprio + mobília", () => {
    expect(r.capitalProprioTotal).toBe(133_576);
  });
  it("CORREÇÃO: retorno mensal sobre capital próprio total", () => {
    expect(r.ganhoFinanceiroMensal).toBeCloseTo(4.862, 2);
    expect(r.rentabilidadeAnual).toBeCloseTo(58.34, 1);
  });
  it("CORREÇÃO: total da unidade inclui mobília", () => {
    expect(r.totalUnidade).toBe(517_000);
    expect(r.patrimonioTotal).toBe(517_000);
  });
  it("retorno sobre patrimônio inclui mobília no denominador", () => {
    expect(r.retornoPatrimonioMensal).toBeCloseTo(1.256, 2);
  });
  it("impostos editáveis aplicados sobre a renda líquida", () => {
    expect(r.rendaHolding).toBeCloseTo(6494.82 * 0.91, 1);
    expect(r.rendaPF).toBeCloseTo(6494.82 * 0.73, 1);
  });
  it("imposto customizado (Holding 6% da planilha)", () => {
    const r6 = calcular({ ...cenarioAtual, impostoHolding: 0.06 });
    expect(r6.rendaHolding).toBeCloseTo(6494.82 * 0.94, 1);
  });
});

describe("calcular — estados vazios (campos zerados)", () => {
  const r = calcular(defaultInputs);
  it("defaults monetários zerados, taxas preservadas", () => {
    expect(defaultInputs.valorImovel).toBe(0);
    expect(defaultInputs.diaria).toBe(0);
    expect(defaultInputs.taxaAdminSeguro).toBe(0.15);
    expect(defaultInputs.impostoHolding).toBe(0.09);
    expect(defaultInputs.impostoPF).toBe(0.27);
  });
  it("sem receita → flags de validade desligadas, nada de NaN/Infinity", () => {
    expect(r.temReceita).toBe(false);
    expect(r.temBaseCapital).toBe(false);
    for (const v of Object.values(r)) {
      if (typeof v === "number") {
        expect(Number.isFinite(v)).toBe(true);
      }
    }
  });
  it("divisor zero → retorno zero (UI exibe traço)", () => {
    expect(r.ganhoFinanceiroMensal).toBe(0);
    expect(r.retornoPatrimonioMensal).toBe(0);
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `cd /Users/bugateira/Code/airbnb-calc && pnpm test`
Expected: FAIL — `impostoHolding` não existe em `CalculatorInputs`, `capitalProprioTotal`/`temReceita`/`retornoPatrimonioMensal` não existem em `CalculatorResults`.

- [ ] **Step 4: Implementar o motor v2**

Substituir integralmente `client/src/lib/calculator.ts`:

```ts
/**
 * Motor de Cálculo — Calculadora de Rentabilidade Short Stay
 * Baseado na planilha RENTABILIDADE (NILSON - RENATO 1)
 *
 * Cadeia: Imóvel → Ocupação → Receita Bruta → Despesas → Renda Líquida → Retornos
 * Correções v2 (spec 2026-07-05):
 *  - Base do ROI = capital próprio (Fluxo) + mobília/decoração (capitalProprioTotal)
 *  - Total da unidade e retorno sobre patrimônio incluem mobília
 *  - Impostos Holding/PF editáveis (padrão 9% / 27%)
 *  - Flags de validade p/ estados vazios (sem NaN/Infinity na UI)
 */

export interface CalculatorInputs {
  // === FICHA TÉCNICA ===
  areaM2: number;
  valorImovel: number;
  mobilia: number;

  // === OCUPAÇÃO ===
  diaria: number;
  diasOcupacao: number;

  // === FINANCIAMENTO ===
  capitalProprio: number;   // total pago no Fluxo (ato+mensais+semestrais+anuais) — SEM mobília
  saldoFinanciar: number;
  taxaJurosMensal: number;  // decimal (0.01 = 1% a.m.)
  prazoMeses: number;

  // === DESPESAS FIXAS ===
  condominio: number;
  iptuMensal: number;
  wifi: number;
  agua: number;
  luz: number;
  taxaAdminSeguro: number;  // % sobre receita bruta (decimal)

  // === AIRBNB ===
  taxaPlataforma: number;
  custoLimpeza: number;
  checkInsMes: number;
  taxaGestao: number;

  // === IMPOSTOS (editáveis) ===
  impostoHolding: number;   // decimal, padrão 0.09
  impostoPF: number;        // decimal, padrão 0.27
}

export interface CalculatorResults {
  // === FICHA TÉCNICA ===
  valorPorM2: number;
  totalUnidade: number;        // imóvel + mobília
  capitalProprioTotal: number; // capitalProprio + mobília — base do ROI
  patrimonioTotal: number;     // = totalUnidade (alias semântico p/ retornos)

  // === RECEITA ===
  receitaBrutaMensal: number;
  taxaPlataformaValor: number;
  custoLimpezaMensal: number;
  receitaLiquidaPlataforma: number;

  // === DESPESAS ===
  adminSeguro: number;
  gestaoValor: number;
  parcelaFinanciamento: number;
  totalDespesasFixas: number;
  totalDespesas: number;

  // === RESULTADO ===
  rendaMensalLiquida: number;
  rendaHolding: number;
  rendaPF: number;

  // === RETORNOS ===
  ganhoFinanceiroMensal: number;      // % a.m. sobre capitalProprioTotal
  rentabilidadeAnual: number;         // % a.a. (linear ×12)
  rentabilidadeHoldingAnual: number;
  rentabilidadePFAnual: number;
  retornoPatrimonioMensal: number;    // % a.m. sobre patrimonioTotal
  retornoPatrimonioAnual: number;

  // === BREAKEVEN ===
  diasBreakeven: number;
  ocupacaoBreakeven: number;

  // === VALIDADE (UI mostra "—" quando false) ===
  temReceita: boolean;
  temBaseCapital: boolean;
}

/** PMT — equivalente ao PGTO do Excel/Sheets (tabela Price) */
export function pmt(taxa: number, nper: number, pv: number): number {
  if (pv === 0 || nper === 0) return 0;
  if (taxa === 0) return pv / nper;
  return (pv * taxa * Math.pow(1 + taxa, nper)) / (Math.pow(1 + taxa, nper) - 1);
}

/** Divisão protegida: retorna 0 quando o denominador não é positivo */
function safeDiv(num: number, den: number): number {
  return den > 0 ? num / den : 0;
}

export function calcular(inputs: CalculatorInputs): CalculatorResults {
  const {
    areaM2, valorImovel, mobilia,
    diaria, diasOcupacao,
    capitalProprio, saldoFinanciar, taxaJurosMensal, prazoMeses,
    condominio, iptuMensal, wifi, agua, luz, taxaAdminSeguro,
    taxaPlataforma, custoLimpeza, checkInsMes, taxaGestao,
    impostoHolding, impostoPF,
  } = inputs;

  // === FICHA TÉCNICA ===
  const valorPorM2 = safeDiv(valorImovel, areaM2);
  const totalUnidade = valorImovel + mobilia;
  const capitalProprioTotal = capitalProprio + mobilia;
  const patrimonioTotal = totalUnidade;

  // === RECEITA ===
  const receitaBrutaMensal = diaria * diasOcupacao;
  const taxaPlataformaValor = receitaBrutaMensal * taxaPlataforma;
  const custoLimpezaMensal = custoLimpeza * checkInsMes;
  const receitaLiquidaPlataforma = receitaBrutaMensal - taxaPlataformaValor;

  // === DESPESAS ===
  const adminSeguro = receitaBrutaMensal * taxaAdminSeguro;
  const gestaoValor = receitaBrutaMensal * taxaGestao;
  const parcelaFinanciamento = pmt(taxaJurosMensal, prazoMeses, saldoFinanciar);

  const totalDespesasFixas = condominio + iptuMensal + wifi + agua + luz + parcelaFinanciamento;

  const totalDespesas =
    condominio + iptuMensal + wifi + agua + luz +
    adminSeguro + gestaoValor +
    taxaPlataformaValor + custoLimpezaMensal +
    parcelaFinanciamento;

  // === RESULTADO ===
  const rendaMensalLiquida = receitaBrutaMensal - totalDespesas;
  const rendaHolding = rendaMensalLiquida * (1 - impostoHolding);
  const rendaPF = rendaMensalLiquida * (1 - impostoPF);

  // === RETORNOS (base corrigida) ===
  const ganhoFinanceiroMensal = safeDiv(rendaMensalLiquida * 100, capitalProprioTotal);
  const rentabilidadeAnual = ganhoFinanceiroMensal * 12;
  const rentabilidadeHoldingAnual = safeDiv(rendaHolding * 100, capitalProprioTotal) * 12;
  const rentabilidadePFAnual = safeDiv(rendaPF * 100, capitalProprioTotal) * 12;
  const retornoPatrimonioMensal = safeDiv(rendaMensalLiquida * 100, patrimonioTotal);
  const retornoPatrimonioAnual = retornoPatrimonioMensal * 12;

  // === BREAKEVEN ===
  const despesasFixasBreakeven = condominio + iptuMensal + wifi + agua + luz + parcelaFinanciamento + custoLimpezaMensal;
  const percentualVariavel = taxaAdminSeguro + taxaGestao + taxaPlataforma;
  const receitaNecessaria = percentualVariavel < 1
    ? safeDiv(despesasFixasBreakeven, 1 - percentualVariavel) : 0;
  const diasBreakeven = diaria > 0 ? Math.ceil(receitaNecessaria / diaria) : 0;
  const ocupacaoBreakeven = (diasBreakeven / 30) * 100;

  return {
    valorPorM2, totalUnidade, capitalProprioTotal, patrimonioTotal,
    receitaBrutaMensal, taxaPlataformaValor, custoLimpezaMensal, receitaLiquidaPlataforma,
    adminSeguro, gestaoValor, parcelaFinanciamento, totalDespesasFixas, totalDespesas,
    rendaMensalLiquida, rendaHolding, rendaPF,
    ganhoFinanceiroMensal, rentabilidadeAnual, rentabilidadeHoldingAnual, rentabilidadePFAnual,
    retornoPatrimonioMensal, retornoPatrimonioAnual,
    diasBreakeven, ocupacaoBreakeven,
    temReceita: receitaBrutaMensal > 0,
    temBaseCapital: capitalProprioTotal > 0,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals).replace(".", ",")}%`;
}

/** Campos monetários/quantidades zerados (spec: site abre vazio); taxas com padrão de mercado */
export const defaultInputs: CalculatorInputs = {
  areaM2: 0,
  valorImovel: 0,
  mobilia: 0,
  diaria: 0,
  diasOcupacao: 0,
  capitalProprio: 0,
  saldoFinanciar: 0,
  taxaJurosMensal: 0.01,
  prazoMeses: 360,
  condominio: 0,
  iptuMensal: 0,
  wifi: 0,
  agua: 0,
  luz: 0,
  taxaAdminSeguro: 0.15,
  taxaPlataforma: 0.03,
  custoLimpeza: 0,
  checkInsMes: 0,
  taxaGestao: 0,
  impostoHolding: 0.09,
  impostoPF: 0.27,
};
```

- [ ] **Step 5: Rodar testes até passar**

Run: `pnpm test`
Expected: PASS (3 describe / 15 its). Se `4.862`/`58.34` divergirem na 2ª casa, recalcular o esperado com `console.log` e ajustar tolerância para `toBeCloseTo(x, 1)` — a fonte de verdade é a fórmula da spec, não o arredondamento.

- [ ] **Step 6: Atualizar consumidores mínimos em Home.tsx**

Em `client/src/pages/Home.tsx:441-448`, substituir o bloco `inputsComFluxo` por (mobília agora é somada DENTRO do motor):

```ts
  const inputsComFluxo = useMemo(() => ({
    ...inputs,
    // Capital próprio = total pago no Fluxo (a mobília é somada dentro do motor de cálculo)
    capitalProprio: fluxoResults.totalInvestido > 0 ? fluxoResults.totalInvestido : inputs.capitalProprio,
    saldoFinanciar: fluxoResults.financiamento > 0 ? fluxoResults.financiamento : inputs.saldoFinanciar,
  }), [inputs, fluxoResults]);
```

Em `client/src/pages/Home.tsx:923` (bloco Breakeven do Investimento), substituir:

```ts
              const totalInv = (fluxoResults.totalInvestido > 0 ? fluxoResults.totalInvestido : inputs.capitalProprio) + (calc.mobilia || 0);
```

por:

```ts
              const totalInv = results.capitalProprioTotal;
```

Remover `incluiDecoracao` do destructuring da linha 395 APENAS se não sobrar nenhum uso no arquivo (verificar com `grep -n incluiDecoracao client/src/pages/Home.tsx` — a prop passada ao `<QuadroRentabilidade incluiDecoracao=...>` na linha ~994 será removida na Task 5; até lá, manter).

- [ ] **Step 7: Typecheck + testes**

Run: `pnpm check && pnpm test`
Expected: 0 erros TS. Nota: `FluxoContext`/`shareLink`/`CenariosContext` tipam `CalculatorInputs` — se o `tsc` acusar objetos literais sem `impostoHolding`/`impostoPF`, corrigir o literal espalhando defaults: `{ ...defaultInputs, ...objeto }`.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: motor de cálculo v2 — base do ROI com decoração, impostos editáveis, testes"
```

---

### Task 2: Fontes ITC Avant Garde + identidade no index.html

**Files:**
- Create: `client/public/fonts/` (4 OTFs), `client/public/vitacon-logo.svg`, `client/public/favicon.svg`
- Modify: `client/src/index.css` (font-faces + fonte base), `client/index.html`, `client/src/main.tsx`

- [ ] **Step 1: Copiar assets**

```bash
cd /Users/bugateira/Code/airbnb-calc
mkdir -p client/public/fonts
F="/Users/bugateira/Desktop/VITACON/ITC Avant Garde Gothic"
cp "$F/ITC Avant Garde Gothic CE Book.otf"  client/public/fonts/avantgarde-book.otf
cp "$F/ITC Avant Garde Gothic Medium.otf"   client/public/fonts/avantgarde-medium.otf
cp "$F/ITC Avant Garde Gothic CE Demi.otf"  client/public/fonts/avantgarde-demi.otf
cp "$F/ITC Avant Garde Gothic Bold.otf"     client/public/fonts/avantgarde-bold.otf
cp /Users/bugateira/vitacon-design-system/assets/vitacon-logo.svg client/public/vitacon-logo.svg
```

- [ ] **Step 2: JetBrains Mono self-hosted**

```bash
pnpm add @fontsource/jetbrains-mono
```

Em `client/src/main.tsx`, adicionar no topo (junto dos imports existentes):

```ts
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
```

- [ ] **Step 3: @font-face no index.css**

No topo de `client/src/index.css`, logo após os `@import`, adicionar:

```css
/* ── ITC Avant Garde Gothic — fonte oficial Vitacon (OTFs locais) ── */
@font-face {
  font-family: "Avant Garde";
  src: url("/fonts/avantgarde-book.otf") format("opentype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Avant Garde";
  src: url("/fonts/avantgarde-medium.otf") format("opentype");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Avant Garde";
  src: url("/fonts/avantgarde-demi.otf") format("opentype");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Avant Garde";
  src: url("/fonts/avantgarde-bold.otf") format("opentype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

:root {
  --font-sans: "Avant Garde", "Century Gothic", Futura, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

E no fim do arquivo:

```css
body {
  font-family: var(--font-sans);
}
```

- [ ] **Step 4: Favicon Vitacon**

Criar `client/public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 84">
  <rect width="84" height="84" rx="16" fill="#2800FF"/>
  <g fill="#fff" transform="translate(3,0)">
    <polygon points="8,8 20,8 78,78 66,78"/>
    <rect x="69" y="8" width="9" height="70"/>
  </g>
</svg>
```

- [ ] **Step 5: index.html — título, favicon, OG**

Em `client/index.html`: trocar `<title>` para `Vitacon — Calculadora de Rentabilidade`; substituir TODAS as tags `apple-touch-icon`/`icon`/`shortcut icon` (linhas 20-24) por:

```html
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/favicon.svg" />
```

Nas metas OG/Twitter (linhas 31, 35), trocar a URL da imagem por `https://airbnbcalculadora.com.br/og-image.png` (gerar o og-image.png na Task 9 a partir de um screenshot do site pronto, 1200×630, e salvar em `client/public/og-image.png`). Atualizar também `og:title`/`og:description` se mencionarem "Short Stay" → "Vitacon".

- [ ] **Step 6: Verificar fontes carregando**

Run: dev server já ativo (preview `airbnb-calc`, porta 3000). `preview_eval`: `document.fonts.load('600 16px "Avant Garde"').then(f => f.length)` → Expected: `1`. Testar acentos: `preview_eval` inserindo `ãõçáéê ÃÕÇ` num elemento com a fonte e screenshot — glifos não podem cair no fallback (checar visualmente: Avant Garde tem "a" de bojo circular geométrico).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: fontes ITC Avant Garde Gothic, favicon e identidade Vitacon no index.html"
```

---

### Task 3: Tokens Vitacon — shadcn vars + módulo compartilhado de cores

**Files:**
- Modify: `client/src/index.css` (blocos `:root` e `.dark`)
- Create: `client/src/lib/vitaconColors.ts`
- Modify: `client/src/pages/Home.tsx` (remover `useColors` local, importar o compartilhado)
- Modify: `client/src/pages/Fluxo.tsx` (idem)

- [ ] **Step 1: Substituir valores das CSS vars shadcn**

Em `client/src/index.css`, no bloco `:root` existente, substituir os VALORES (mantendo todos os nomes de var) pelos equivalentes Vitacon light:

```css
:root {
  --radius: 0.75rem;

  --background: #ffffff;
  --foreground: #0a0a0b;
  --card: #ffffff;
  --card-foreground: #0a0a0b;
  --popover: #ffffff;
  --popover-foreground: #0a0a0b;
  --primary: #2800ff;
  --primary-foreground: #ffffff;
  --secondary: #f5f5f5;
  --secondary-foreground: #0a0a0b;
  --muted: #f5f5f5;
  --muted-foreground: #666666;
  --accent: rgba(40, 0, 255, 0.06);
  --accent-foreground: #2800ff;
  --destructive: #d42600;
  --destructive-foreground: #ffffff;
  --border: #e5e5e5;
  --input: #e5e5e5;
  --ring: rgba(40, 0, 255, 0.4);
  --chart-1: #2800ff;
  --chart-2: #0e8a4a;
  --chart-3: #b45309;
  --chart-4: #d42600;
  --chart-5: #4a4a35;
}
```

E no bloco `.dark` (mantendo os nomes; se o bloco atual tiver vars extras de sidebar etc., aplicar a mesma lógica de mapeamento — fundo ink, azul clareado):

```css
.dark {
  --background: #0a0a0b;
  --foreground: #ffffff;
  --card: #141414;
  --card-foreground: #ffffff;
  --popover: #141414;
  --popover-foreground: #ffffff;
  --primary: #6e5cff;
  --primary-foreground: #ffffff;
  --secondary: #1f1f1f;
  --secondary-foreground: #ffffff;
  --muted: #1f1f1f;
  --muted-foreground: #999999;
  --accent: rgba(110, 92, 255, 0.12);
  --accent-foreground: #a99cff;
  --destructive: #ff6b57;
  --destructive-foreground: #ffffff;
  --border: #262626;
  --input: #262626;
  --ring: rgba(110, 92, 255, 0.5);
  --chart-1: #6e5cff;
  --chart-2: #3fd68f;
  --chart-3: #fbbf24;
  --chart-4: #ff6b57;
  --chart-5: #999999;
}
```

- [ ] **Step 2: Criar o módulo compartilhado de cores**

Criar `client/src/lib/vitaconColors.ts` — mesmas CHAVES do `useColors` de `Home.tsx:61-105` + as extras usadas em `Fluxo.tsx` (conferir com `grep -o "colors\.[a-zA-Z]*" client/src/pages/Fluxo.tsx | sort -u` e incluir TODAS; se Fluxo usar chaves violet*, mapear violet→blue):

```ts
/**
 * Paleta Vitacon — fonte única de cores para Home e Fluxo.
 * Azul elétrico #2800FF (marca) · verde positivo · âmbar despesas · vermelho negativo.
 * No dark, o azul clareia para #6E5CFF (contraste AA sobre #0A0A0B).
 */
import { useMemo } from "react";

export function useVitaconColors(isDark: boolean) {
  return useMemo(() => {
    const blue = isDark ? "#6E5CFF" : "#2800FF";
    const green = isDark ? "#3FD68F" : "#0E8A4A";
    const amber = isDark ? "#FBBF24" : "#B45309";
    const red = isDark ? "#FF6B57" : "#D42600";
    const a = (hex: string, alpha: number) => {
      const n = parseInt(hex.slice(1), 16);
      return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
    };
    return {
      // Surfaces
      surface: isDark ? "#141414" : "#FFFFFF",
      surfaceHover: isDark ? "#1A1A1A" : "#FAFAFA",
      border: isDark ? "#262626" : "#E5E5E5",
      borderFocus: a(blue, 0.6),
      inputBg: isDark ? "#1A1A1A" : "#F7F7F7",
      inputBgFocus: isDark ? "#1F1F1F" : "#FFFFFF",
      // Text hierarchy
      text1: isDark ? "#FFFFFF" : "#0A0A0B",
      text2: isDark ? "#E6E6E6" : "#333333",
      text3: isDark ? "#999999" : "#666666",
      text4: isDark ? "#666666" : "#999999",
      // Accents
      blue,
      blueGlow: a(blue, isDark ? 0.16 : 0.08),
      blueBorder: a(blue, 0.25),
      blueBg: a(blue, 0.06),
      blueIconBg: a(blue, isDark ? 0.14 : 0.09),
      green,
      greenGlow: a(green, isDark ? 0.16 : 0.08),
      greenBorder: a(green, 0.25),
      greenBg: a(green, 0.06),
      greenIconBg: a(green, isDark ? 0.14 : 0.09),
      amber,
      amberGlow: a(amber, isDark ? 0.16 : 0.08),
      amberBorder: a(amber, 0.25),
      amberBg: a(amber, 0.06),
      amberIconBg: a(amber, isDark ? 0.14 : 0.09),
      red,
      redGlow: a(red, isDark ? 0.16 : 0.08),
      redBorder: a(red, 0.25),
      redBg: a(red, 0.06),
      // Violet → azul da marca (compat com chaves antigas do Fluxo)
      violet: blue,
      violetGlow: a(blue, isDark ? 0.16 : 0.08),
      violetBorder: a(blue, 0.25),
      violetBg: a(blue, 0.06),
      violetIconBg: a(blue, isDark ? 0.14 : 0.09),
      // Divider
      divider: isDark ? "#232323" : "#ECECEC",
      // Shadows
      cardShadow: isDark
        ? "none"
        : "0 1px 2px rgba(10,10,11,0.04), 0 8px 24px rgba(10,10,11,0.05)",
      cardShadowHover: isDark
        ? "none"
        : "0 2px 8px rgba(10,10,11,0.06), 0 12px 32px rgba(10,10,11,0.08)",
      inputShadow: isDark ? "none" : "inset 0 1px 2px rgba(10,10,11,0.03)",
      focusShadow: `0 0 0 3px ${a(blue, 0.12)}`,
      // Mono font color
      mono: isDark ? "#FFFFFF" : "#0A0A0B",
    };
  }, [isDark]);
}
```

- [ ] **Step 3: Trocar o useColors nas duas páginas**

Em `client/src/pages/Home.tsx`: apagar a função `useColors` (linhas 60-105) e adicionar no bloco de imports:

```ts
import { useVitaconColors as useColors } from "@/lib/vitaconColors";
```

(As dezenas de `ReturnType<typeof useColors>` continuam válidas.) Repetir o mesmo em `client/src/pages/Fluxo.tsx` (função local na linha ~35).

- [ ] **Step 4: Typecheck**

Run: `pnpm check`
Expected: 0 erros. Se Fluxo usar chave que não existe no módulo, adicioná-la ao módulo (não recriar função local).

- [ ] **Step 5: Verificação visual rápida**

Screenshot da calculadora nos 2 temas (preview + `document.documentElement.classList.toggle('dark')` via toggle da navbar). Cores devem já estar Vitacon (azul #2800FF em labels/CTAs no claro).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: tokens Vitacon — shadcn vars + paleta compartilhada Home/Fluxo"
```

---

### Task 4: App shell — NavBar Vitacon, fundo limpo, fim das animações que escondem conteúdo

**Files:**
- Modify: `client/src/App.tsx`
- Modify: `client/src/pages/Home.tsx` (GlassPanel, hero, WaterfallBar, fontes Geist→tokens)

- [ ] **Step 1: NavBar e fundo**

Em `client/src/App.tsx`:

1. Substituir o `<img src="/manus-storage/logo-v2_99a722a8.png" .../>` + `<span>Short Stay</span>` (linhas 47-60) por:

```tsx
      <div className="flex items-center gap-2 shrink-0" style={{ color: isDark ? "#FFFFFF" : "#0A0A0B" }}>
        <img src="/vitacon-logo.svg" alt="Vitacon" className="h-4 md:h-5 w-auto" style={{ filter: isDark ? "invert(1)" : "none" }} />
      </div>
```

   (o SVG usa `currentColor`? Ele tem `fill="currentColor"` — nesse caso preferir `<span>` inline com o SVG importado via `?raw` OU simplesmente aplicar `color` no wrapper e usar máscara. Mais simples e robusto: copiar o conteúdo do SVG inline no JSX como componente `VitaconWordmark` com `fill="currentColor"`, sem `<img>`:)

```tsx
function VitaconWordmark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 84" fill="currentColor" className={className} role="img" aria-label="Vitacon">
      <polygon points="8,8 20,8 78,78 66,78" />
      <rect x="69" y="8" width="9" height="70" />
      <rect x="89.5" y="24" width="9" height="54" />
      <rect x="89.5" y="8" width="9" height="9.5" rx="2" />
      <rect x="111" y="8" width="9" height="70" />
      <rect x="110" y="24" width="23" height="7" />
      <rect x="176" y="24" width="9" height="54" />
      <g fill="none" stroke="currentColor" strokeWidth="9">
        <ellipse cx="156" cy="51" rx="16" ry="22.4" />
        <path d="M236.86,65.40 A22.4,22.4 0 1 1 236.86,36.60" strokeLinecap="butt" />
        <circle cx="275" cy="51" r="22.4" />
        <path d="M314,78 L314,46 A17,17 0 0 1 348,46 L348,78" strokeLinecap="butt" />
      </g>
    </svg>
  );
}
```

   Uso na NavBar: `<VitaconWordmark className="h-4 md:h-5 w-auto" />` dentro de um wrapper com `style={{ color: isDark ? "#fff" : "#0A0A0B" }}`.

2. Nos estilos oklch da NavBar (linhas 38-42, 66-68, 78-86, 101, 109-112): trocar por tokens — `background: isDark ? "rgba(10,10,11,0.85)" : "rgba(255,255,255,0.9)"`, bordas `#262626`/`#E5E5E5`, tab ativa `color: #6E5CFF | #2800FF`, label direito "Rentabilidade Imobiliária" → `Vitacon · Rentabilidade`.

3. `GlobalBackground` (linhas 123-181): substituir o corpo inteiro por `return null;` e remover imports órfãos (`useCursorGlow`, `motion` se não sobrar uso).

4. `Router` (linha 192-194): `background: "var(--background)"`, `fontFamily: "var(--font-sans)"`.

- [ ] **Step 2: GlassPanel sem fade + hero compacto**

Em `client/src/pages/Home.tsx`:

1. `GlassPanel` (linhas 372-385) — trocar `motion.div` com initial opacity 0 por div puro (assinatura mantém `delay` para não quebrar call sites, mas ignora):

```tsx
function GlassPanel({ children, delay: _delay = 0, className = "", colors }: {
  children: React.ReactNode; delay?: number; className?: string; colors: ReturnType<typeof useColors>;
}) {
  return (
    <div
      className={`rounded-2xl p-4 md:p-5 ${className}`}
      style={{ background: colors.surface, border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}
    >
      {children}
    </div>
  );
}
```

2. Hero (seção linhas 478-511): reescrever para compacto — sem `motion.div` de entrada, título em Avant Garde Demi:

```tsx
      <section className="px-4 md:px-6 pt-8 md:pt-12 pb-5 md:pb-8 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
          style={{ background: colors.blueBg, color: colors.blue, border: `1px solid ${colors.blueBorder}`, fontFamily: "var(--font-mono)" }}>
          Análise em tempo real
        </div>
        <h1 className="text-3xl md:text-5xl leading-tight" style={{ color: colors.text1, fontWeight: 600 }}>
          Calculadora de <span style={{ color: colors.blue }}>rentabilidade</span>
        </h1>
        <h2 className="sr-only">Simulador de Rentabilidade para Locação de Curta Temporada</h2>
        <p className="mt-3 text-sm md:text-base" style={{ color: colors.text3 }}>
          Simule o retorno do seu imóvel em locação de curta temporada.
        </p>
      </section>
```

   (Manter o botão "Salvar cenário" que existe nessa seção — só reestilizar: fundo `colors.blue`, texto branco, radius 12px.)

3. Buscar TODAS as ocorrências `'Geist'`/`'Geist Mono'` em Home.tsx (`grep -n "Geist" client/src/pages/Home.tsx`) e trocar: `'Geist', sans-serif` → `var(--font-sans)`; `'Geist Mono', monospace` → `var(--font-mono)`. Repetir para `Fluxo.tsx` e `App.tsx`.

4. Remover `motion.` restantes de entrada em Home.tsx onde `initial={{ opacity: 0 ... }}` esconder conteúdo (StatCard linha ~263, seções). WaterfallBar (linha 288-292) pode manter a animação de largura (não esconde conteúdo). Remover imports não usados.

- [ ] **Step 3: Typecheck + screenshot**

Run: `pnpm check` → 0 erros. Screenshot full-page nos 2 temas: sem seções pretas/invisíveis ao rolar; navbar com wordmark Vitacon.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: shell Vitacon — navbar, fundo limpo, hero compacto, fim dos fade-ins que escondem conteúdo"
```

---

### Task 5: SplashScreen — abertura full screen com animação do logo

**Files:**
- Create: `client/src/components/SplashScreen.tsx`
- Modify: `client/src/App.tsx` (montar antes do Router)

- [ ] **Step 1: Componente**

Criar `client/src/components/SplashScreen.tsx` (animação portada de `/Users/bugateira/vitacon-logo/index.html`, single-run: V surge → desliza e revela "itacon" → hold → fade-out do overlay; total ~2,8s):

```tsx
/**
 * SplashScreen — abertura full screen Vitacon.
 * Fundo azul #2800FF, logo branco com revelação (port do vitacon-logo/index.html, single-run).
 * - roda 1× por sessão (sessionStorage "splash-shown")
 * - clique/Esc pula
 * - prefers-reduced-motion: não exibe
 */
import { useEffect, useState } from "react";

const CSS = `
.vsplash{position:fixed;inset:0;z-index:9999;background:#2800FF;display:grid;place-items:center;overflow:hidden;transition:opacity .5s ease;}
.vsplash.out{opacity:0;pointer-events:none;}
.vsplash svg{width:min(56vw,132svh);max-width:720px;height:auto;shape-rendering:geometricPrecision;}
.vsplash #vSlide,.vsplash #itaconSlide{transform:translateX(137px);animation:vsplash-slide 2.3s .45s cubic-bezier(.65,0,.35,1) forwards;}
.vsplash #wipe{transform-box:fill-box;transform-origin:0 50%;transform:translateX(137px) scaleX(0);animation:vsplash-wipe 2.3s .45s cubic-bezier(.65,0,.35,1) forwards;}
.vsplash #vPop{transform-box:fill-box;transform-origin:50% 50%;animation:vsplash-pop .45s cubic-bezier(.65,0,.35,1) both;}
@keyframes vsplash-pop{from{opacity:0;transform:scale(.92);}to{opacity:1;transform:scale(1);}}
@keyframes vsplash-slide{0%{transform:translateX(137px);}18%{transform:translateX(137px);}48%{transform:translateX(0);}100%{transform:translateX(0);}}
@keyframes vsplash-wipe{0%{transform:translateX(137px) scaleX(0);}18%{transform:translateX(137px) scaleX(0);}48%{transform:translateX(0) scaleX(1);}100%{transform:translateX(0) scaleX(1);}}
`;

export function SplashScreen() {
  const [phase, setPhase] = useState<"hidden" | "playing" | "leaving">(() => {
    if (typeof window === "undefined") return "hidden";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shown = sessionStorage.getItem("splash-shown");
    return reduced || shown ? "hidden" : "playing";
  });

  useEffect(() => {
    if (phase !== "playing") return;
    sessionStorage.setItem("splash-shown", "1");
    const leave = () => setPhase("leaving");
    const t = setTimeout(leave, 2800);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") leave(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [phase]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const t = setTimeout(() => setPhase("hidden"), 550);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div className={`vsplash${phase === "leaving" ? " out" : ""}`} onClick={() => setPhase("leaving")} role="presentation">
      <style>{CSS}</style>
      <svg viewBox="0 0 360 84" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vitacon">
        <defs>
          <clipPath id="reveal" clipPathUnits="userSpaceOnUse">
            <rect id="wipe" x="84" y="-4" width="270" height="92" />
          </clipPath>
        </defs>
        <g id="vSlide">
          <g id="vPop" fill="#fff">
            <polygon points="8,8 20,8 78,78 66,78" />
            <rect x="69" y="8" width="9" height="70" />
          </g>
        </g>
        <g clipPath="url(#reveal)">
          <g id="itaconSlide">
            <g fill="#fff">
              <rect x="89.5" y="24" width="9" height="54" />
              <rect x="89.5" y="8" width="9" height="9.5" rx="2" />
              <rect x="111" y="8" width="9" height="70" />
              <rect x="110" y="24" width="23" height="7" />
              <rect x="176" y="24" width="9" height="54" />
            </g>
            <g fill="none" stroke="#fff" strokeWidth="9">
              <ellipse cx="156" cy="51" rx="16" ry="22.4" />
              <path d="M236.86,65.40 A22.4,22.4 0 1 1 236.86,36.60" strokeLinecap="butt" />
              <circle cx="275" cy="51" r="22.4" />
              <path d="M314,78 L314,46 A17,17 0 0 1 348,46 L348,78" strokeLinecap="butt" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Montar no App**

Em `client/src/App.tsx`, importar e renderizar dentro de `<Router>`-wrapper (função `App`), logo antes de `<Router />`:

```tsx
import { SplashScreen } from "./components/SplashScreen";
// ... dentro do JSX de App():
              <Toaster />
              <SplashScreen />
              <Router />
```

- [ ] **Step 3: Verificar**

`preview_eval`: `sessionStorage.removeItem("splash-shown"); location.reload()` → screenshot imediato: overlay azul com logo animando; após ~3,5s novo screenshot: overlay sumiu, calculadora visível. Reload de novo SEM limpar sessionStorage → splash não aparece.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: abertura full screen com animação do logo Vitacon (1x por sessão, pulável)"
```

---### Task 6: Quadro de Rentabilidade v2 (PNG exportável)

**Files:**
- Create: `client/public/airbnb-logo.svg`
- Rewrite: `client/src/components/QuadroRentabilidade.tsx`
- Modify: `client/src/pages/Home.tsx` (call site ~linha 990-996)

- [ ] **Step 1: Logo Airbnb local**

```bash
curl -sL "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg" -o client/public/airbnb-logo.svg
head -c 200 client/public/airbnb-logo.svg
```

Expected: começa com `<svg`/`<?xml` e tem >1 KB. Se o download falhar: procurar o logo nos PDFs/assets de `/Users/bugateira/Desktop/VITACON/` ou pedir o arquivo ao Denis — NÃO usar URL remota no componente.

- [ ] **Step 2: Reescrever o componente**

Substituir `client/src/components/QuadroRentabilidade.tsx` inteiro. Pontos obrigatórios (o restante do markup segue o layout atual de linhas/blocos):

1. Props: remover `incluiDecoracao` e `isDark` — o quadro exporta SEMPRE claro (peça de WhatsApp): `interface Props { inputs: CalculatorInputs; results: CalculatorResults; nomeEmpreendimento?: string; }`
2. `const AIRBNB_LOGO_URL = "/airbnb-logo.svg";` — altura 56px no header.
3. `const totalInvestido = results.capitalProprioTotal;` (não mais `inputs.capitalProprio`).
4. Paleta fixa (sem tokens de tema — é uma peça de exportação): fundo externo `#F5F5F5`, card `#FFFFFF` radius 16 sombra `0 4px 24px rgba(0,0,0,0.08)`, título `#0A0A0B`, labels `#666`, despesas `#B45309`, receita/resultados `#0E8A4A`, destaque "Total investido" com fundo `rgba(40,0,255,0.05)` e valor `#2800FF`, divisores `#ECECEC`.
5. Fonte: `fontFamily: '"Avant Garde", "Century Gothic", sans-serif'` nos textos; valores numéricos com `fontFamily: '"JetBrains Mono", monospace'`.
6. Linhas de despesas: reaproveitar o array atual (condomínio, IPTU+contas, admin+seguro, parcela) e ADICIONAR quando > 0: `{ label: "Taxa da plataforma (${Math.round(inputs.taxaPlataforma*100)}%)", value: results.taxaPlataformaValor }`, `{ label: "Limpeza (${inputs.checkInsMes} check-ins)", value: results.custoLimpezaMensal }`, `{ label: "Gestão (${Math.round(inputs.taxaGestao*100)}%)", value: results.gestaoValor }` — manter o sort decrescente.
7. Blocos de resultado (HighlightRow): Renda mensal líquida, Renda anual líquida, Retorno s/ investimento A.M (`results.ganhoFinanceiroMensal`), A.A (`results.rentabilidadeAnual`), Retorno s/ patrimônio A.M (`results.retornoPatrimonioMensal`), A.A (`results.retornoPatrimonioAnual`) — se `!results.temReceita || !results.temBaseCapital`, valores percentuais mostram `"—"`.
8. Rodapé novo, após os resultados:

```tsx
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px 6px", opacity: 0.75 }}>
            <svg viewBox="0 0 360 84" fill="#0A0A0B" style={{ height: 12, width: "auto" }} aria-label="Vitacon">
              {/* mesmos paths do VitaconWordmark (Task 4) */}
            </svg>
            <span style={{ color: "#999", fontSize: 10, fontFamily: '"JetBrains Mono", monospace' }}>
              Simulação — {new Date().toLocaleDateString("pt-BR")}
            </span>
          </div>
```

9. Botão "Exportar PNG": fundo `#2800FF`, ícone Download, mesmo handler `toPng` atual com `backgroundColor: "#F5F5F5"`.

- [ ] **Step 3: Atualizar o call site**

Em `client/src/pages/Home.tsx` (~linha 990-996): `<QuadroRentabilidade inputs={inputsComFluxo} results={results} nomeEmpreendimento={nomeEmpreendimento} />` — remover props `incluiDecoracao` e `isDark`. Agora sim: se `incluiDecoracao` ficou sem uso no arquivo, removê-la do destructuring (linha 395).

- [ ] **Step 4: Verificar**

`pnpm check` → 0 erros. Na preview: preencher diária/dias/valores via UI (`preview_fill`), screenshot do quadro; clicar "Exportar PNG" não é verificável headless — conferir que o card renderiza o logo Airbnb (sem ícone quebrado) e o rodapé Vitacon.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: quadro de rentabilidade v2 — logo Airbnb local, rodapé Vitacon, base corrigida"
```

---

### Task 7: Estados vazios, coluna sticky e barra mobile

**Files:**
- Modify: `client/src/pages/Home.tsx`
- Create: `client/src/components/MobileSummaryBar.tsx`

- [ ] **Step 1: Helper de exibição**

Em `client/src/pages/Home.tsx`, junto aos helpers (~linha 107), adicionar:

```ts
const DASH = "—";
function fmtOr(cond: boolean, formatted: string): string {
  return cond ? formatted : DASH;
}
```

Aplicar nos pontos de exibição de retorno/percentual e renda:
- Cards de stats do topo (renda líquida/mês, /ano, % a.m., receita bruta): `fmtOr(results.temReceita, formatCurrency(...))` e `fmtOr(results.temReceita && results.temBaseCapital, formatPercent(...))`.
- `FiscalCard`: adicionar prop `valido: boolean`; quando `false`, renderizar `DASH` no lugar dos valores animados (passar `valido={results.temReceita}` nos 3 call sites, linhas ~830-841).
- Resumo (linhas ~888+) e Breakeven: percentuais/dias com `fmtOr`.
- Breakeven do investimento (linha ~923+): quando `results.rendaMensalLiquida <= 0`, exibir texto `"Preencha receita e despesas para calcular"` no lugar do bloco de meses.

- [ ] **Step 2: Coluna de resultados sticky**

Localizar o wrapper das duas colunas (logo após o hero; grid com a coluna de inputs e a de resultados — conferir com `grep -n "grid" client/src/pages/Home.tsx | head`). Na coluna de RESULTADOS, adicionar wrapper sticky:

```tsx
<div className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
  {/* conteúdo existente da coluna de resultados */}
</div>
```

(top-20 = navbar sticky ~64px + folga. Testar que o scroll interno da coluna funciona e não cria double-scrollbar no desktop; se a coluna de resultados for mais alta que a viewport com frequência, remover `max-h`/`overflow` e deixar só `sticky top-20 self-start`.)

- [ ] **Step 3: Barra mobile**

Criar `client/src/components/MobileSummaryBar.tsx`:

```tsx
/**
 * Barra fixa no rodapé (mobile) com os 3 números-chave.
 * Toque rola até a seção de resultados.
 */
import { formatCurrency, formatPercent, type CalculatorResults } from "@/lib/calculator";
import { useVitaconColors as useColors } from "@/lib/vitaconColors";

export function MobileSummaryBar({ results, isDark }: { results: CalculatorResults; isDark: boolean }) {
  const colors = useColors(isDark);
  const ok = results.temReceita;
  const okPct = ok && results.temBaseCapital;
  const item = (label: string, value: string, color: string) => (
    <div className="flex flex-col items-center min-w-0">
      <span className="text-[10px] uppercase tracking-wider truncate" style={{ color: colors.text4, fontFamily: "var(--font-mono)" }}>{label}</span>
      <span className="text-sm font-bold truncate" style={{ color, fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
  );
  return (
    <button
      className="fixed bottom-0 inset-x-0 z-40 grid grid-cols-3 gap-2 px-4 py-2.5 lg:hidden"
      style={{
        background: isDark ? "rgba(10,10,11,0.92)" : "rgba(255,255,255,0.95)",
        borderTop: `1px solid ${colors.border}`,
        backdropFilter: "blur(16px)",
        paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))",
      }}
      onClick={() => document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" })}
    >
      {item("Renda/mês", ok ? formatCurrency(results.rendaMensalLiquida) : "—", results.rendaMensalLiquida >= 0 ? colors.green : colors.red)}
      {item("Retorno a.m.", okPct ? formatPercent(results.ganhoFinanceiroMensal) : "—", colors.blue)}
      {item("Retorno a.a.", okPct ? formatPercent(results.rentabilidadeAnual) : "—", colors.blue)}
    </button>
  );
}
```

Em Home.tsx: adicionar `id="resultados"` no container da coluna de resultados e renderizar `<MobileSummaryBar results={results} isDark={isDark} />` no fim do componente. Adicionar `pb-20 lg:pb-0` no container principal para a barra não cobrir conteúdo.

- [ ] **Step 4: Verificar + commit**

`pnpm check` → 0 erros. Preview: (a) campos zerados → todos os lugares mostram "—"/estado vazio, sem NaN; (b) `preview_resize` mobile → barra aparece com 3 números; (c) desktop: rolar a página → coluna de resultados acompanha.

```bash
git add -A && git commit -m "feat: estados vazios com traço, resultados sticky no desktop e barra-resumo mobile"
```

---

### Task 8: Impostos editáveis na UI + compat de dados salvos

**Files:**
- Modify: `client/src/pages/Home.tsx` (seção Variantes Fiscais, labels, novo card de inputs)
- Modify: `client/src/lib/shareLink.ts`, `client/src/contexts/CenariosContext.tsx` ou pontos de decode (merge com defaults)

- [ ] **Step 1: Campos de imposto no painel de inputs**

Em Home.tsx, dentro do card "Custos Fixos Mensais" (após o slider de Administração+Seguro, ~linha 749+), adicionar dois campos percentuais reutilizando `InputField` (que trabalha com inteiros — armazenar como decimal exige conversão):

```tsx
              <div className="grid grid-cols-2 gap-3 mt-3">
                <InputField label="Imposto Holding" suffix="%" tooltip="Percentual de imposto sobre a renda líquida na estrutura de holding (padrão 9%)"
                  isDark={isDark} colors={colors}
                  value={Math.round(inputs.impostoHolding * 100)}
                  onChange={(v) => set("impostoHolding")(Math.min(100, v) / 100)} />
                <InputField label="Imposto PF" suffix="%" tooltip="Imposto de renda sobre aluguel como pessoa física (padrão 27%)"
                  isDark={isDark} colors={colors}
                  value={Math.round(inputs.impostoPF * 100)}
                  onChange={(v) => set("impostoPF")(Math.min(100, v) / 100)} />
              </div>
```

- [ ] **Step 2: Labels dinâmicos**

- Linhas 843-850 (rodapé das variantes): `Holding: desconto de {Math.round(inputs.impostoHolding * 100)}% sobre renda bruta` e idem PF (e corrigir o texto: é sobre a **renda líquida**, não bruta).
- Linhas 965-966 (chips do breakeven): `label: \`Holding (−${Math.round(inputs.impostoHolding * 100)}%)\`` com `rendaLiq * (1 - inputs.impostoHolding)`; idem PF.

- [ ] **Step 3: Merge com defaults em TODOS os pontos de restauração**

Cenários antigos e links compartilhados não têm os campos novos. Em cada ponto que injeta `CalculatorInputs` externos:

1. `Home.tsx:416-422` (decodeShareLink): `setCalc(() => ({ ...defaultInputs, ...payload.calc }));`
2. `Home.tsx:427-437` (restaurar-cenario): `setCalc(() => ({ ...defaultInputs, ...cenario.inputs }));`
3. `client/src/contexts/FluxoContext.tsx`: verificar se o estado `calc` hidrata de localStorage (`grep -n "localStorage" client/src/contexts/FluxoContext.tsx`); se sim, aplicar o mesmo spread `{ ...defaultInputs, ...parsed }`.

- [ ] **Step 4: Testar + commit**

`pnpm check && pnpm test` → verdes. Preview: mudar "Imposto Holding" para 6 → card Holding e chips atualizam na hora.

```bash
git add -A && git commit -m "feat: impostos Holding/PF editáveis na UI com labels dinâmicos e compat de cenários antigos"
```

---

### Task 9: Reskin da página Fluxo de Pagamento

**Files:**
- Modify: `client/src/pages/Fluxo.tsx`

- [ ] **Step 1: Varredura de cores hardcoded**

A troca do `useColors` (Task 3) já converteu a maior parte. Varra o restante:

```bash
grep -n "#0f172a\|#22c55e\|#16a34a\|#facc15\|oklch\|Geist" client/src/pages/Fluxo.tsx
```

Mapeamento obrigatório (claro/escuro via `colors.*`): `#22c55e|#16a34a` → `colors.green`; `#facc15` → `colors.amber`; fundos `#0f172a`-like → `colors.surface`; qualquer `oklch(...)` → token equivalente da paleta; `Geist` → `var(--font-sans)`/`var(--font-mono)`. No gráfico SVG (linha azul SAC, bolinhas, chips): linha principal → `colors.blue`, textos → `colors.text2/3`, eixo → `colors.divider`.

- [ ] **Step 2: Hero do Fluxo**

Título "Fluxo de Pagamento" segue o padrão do hero da calculadora (Task 4 Step 2.2): Avant Garde 600, `<span style={{color: colors.blue}}>` na segunda palavra, sem animação de entrada que esconda conteúdo (remover `initial={{opacity:0}}` da seção, se houver).

- [ ] **Step 3: Funcionalidade intacta**

Na preview: mover slider "% do Ato" → totais recalculam; adicionar/editar parcela anual na tabela → Total Investido muda; abrir a Calculadora → "Capital próprio (via Fluxo)" reflete o valor; botão de export do Fluxo funciona com o toggle com/sem decoração (que continua existindo AQUI, apenas para o export).

- [ ] **Step 4: Screenshot 2 temas + commit**

```bash
git add -A && git commit -m "feat: página Fluxo de Pagamento no padrão visual Vitacon"
```

---

### Task 10: Verificação final + og-image

**Files:**
- Create: `client/public/og-image.png`
- Modify: ajustes pontuais que a verificação apontar

- [ ] **Step 1: Suíte completa**

Run: `pnpm check && pnpm test && pnpm build`
Expected: tudo verde, build sem erros.

- [ ] **Step 2: Matriz visual**

Com a preview: screenshots de **Calculadora** e **Fluxo** × **claro/escuro** × **desktop (1440) / mobile (375)** (8 capturas) + splash. Conferir: nenhuma seção invisível; contraste dos textos (usar `preview_inspect` em labels críticos); acentos pt-BR corretos na Avant Garde; números em JetBrains Mono alinhados; barra mobile ok; quadro exportável íntegro.

- [ ] **Step 3: og-image**

Gerar `client/public/og-image.png` (1200×630): screenshot da calculadora preenchida (tema claro) via `preview_resize 1200x630` + `preview_screenshot`, salvar o PNG no caminho. Atualizar as metas do `index.html` se necessário (Task 2 Step 5 já apontou para `/og-image.png`).

- [ ] **Step 4: Mostrar ao Denis e commit final**

Enviar as capturas ao Denis (SendUserFile). Ajustes que ele pedir entram aqui.

```bash
git add -A && git commit -m "chore: verificação final — build, testes e og-image"
```

---

### Task 11: Push + publicação (com o Denis presente)

- [ ] **Step 1: Push da branch**

```bash
git push -u origin redesign-vitacon
```

Após aprovação do Denis: merge na main (`git checkout main && git merge redesign-vitacon && git push`).

- [ ] **Step 2: Publicar no Manus** (sessão do navegador do Denis, via claude-in-chrome)

Abrir manus.im logado, localizar o projeto da calculadora, atualizar o código (sync/import do GitHub ou o mecanismo que o projeto usa), publicar e obter a URL pública (*.manus.space). Smoke test na URL publicada.

- [ ] **Step 3: DNS no registro.br**

O domínio airbnbcalculadora.com.br está sem NENHUM registro (NS a/b.auto.dns.br respondem vazio). No painel registro.br (Denis logado): criar os registros exigidos pelo Manus para domínio custom (CNAME www → host do Manus; apex via A/ALIAS conforme instrução do Manus). Validar com `dig +short airbnbcalculadora.com.br` até resolver e o HTTPS emitir.

**Fallback** (se o Manus não aceitar atualização/domínio): deploy Vercel conectado ao GitHub (`vite build`, output `dist/`... conferir se o build é full-stack: o `pnpm build` também gera server esbuild — na Vercel usar apenas o build estático do Vite com SPA fallback) e apontar o DNS para a Vercel. Decidir com o Denis antes de executar.

---

## Self-review (feito na escrita)

- **Cobertura da spec:** motor v2 (T1) ✓ · fontes/identidade (T2) ✓ · tokens 2 temas (T3) ✓ · shell/hero/animações (T4) ✓ · splash (T5) ✓ · quadro PNG (T6) ✓ · estados vazios + sticky + mobile (T7) ✓ · impostos editáveis + compat (T8) ✓ · Fluxo reskin (T9) ✓ · verificação (T10) ✓ · publicação+DNS (T11) ✓.
- **Consistência de tipos:** `capitalProprioTotal`, `retornoPatrimonioMensal/Anual`, `temReceita`, `temBaseCapital`, `impostoHolding`, `impostoPF` definidos na T1 e usados nas T6-T8 com os mesmos nomes. `useVitaconColors` exportado na T3, importado como `useColors` (alias) nas T3/T7.
- **Riscos conhecidos:** (a) chaves de cor extras no Fluxo → instrução de grep na T3/T9; (b) tsc pode acusar literais `CalculatorInputs` incompletos → instrução na T1 Step 7; (c) sticky com coluna alta → alternativa na T7 Step 2; (d) download do logo Airbnb pode falhar → fallback na T6 Step 1.
