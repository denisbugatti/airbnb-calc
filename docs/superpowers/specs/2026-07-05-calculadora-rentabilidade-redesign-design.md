# Calculadora de Rentabilidade — Redesign Vitacon + Correção do Cálculo

Data: 2026-07-05
Status: aguardando aprovação do Denis

## 1. Objetivo

Corrigir o motor de cálculo da calculadora de rentabilidade short-stay (hoje com ROI inflado) e substituir o visual "Dark Cosmos" pelo design system Vitacon, mantendo todas as funcionalidades existentes: página Fluxo de Pagamento integrada, salvar cenários, link compartilhável e quadro de rentabilidade exportável em PNG.

## 2. Problemas encontrados na versão atual

1. **ROI inflado**: o retorno divide a renda líquida apenas pelo total pago no Fluxo até a entrega (ex.: R$ 93.576), ignorando a decoração/mobília. Resultado: 83,29% a.a. — número irreal para apresentar a investidores.
2. **Retorno sobre patrimônio** divide só pelo valor do imóvel, ignorando a decoração.
3. **Impostos fixos** (Holding 9%, PF 27%) sem possibilidade de ajuste.
4. **Design com contraste ruim**: tema escuro sobre escuro, página fica preta ao rolar (animações `whileInView` que não disparam), seções apertadas.
5. **Logo do Airbnb quebrado** no quadro exportável (aponta para asset do Manus que não existe mais).
6. **Código monolítico**: `Home.tsx` com 1.205 linhas e cores hardcoded em todo lugar.
7. **Domínio fora do ar**: airbnbcalculadora.com.br não tem registro DNS (nameservers a/b.auto.dns.br respondem vazio).

## 3. Decisões de produto (conversadas em 2026-07-05)

| Tema | Decisão |
|---|---|
| Fluxo de Pagamento | Mantém integração automática como está (capital próprio e saldo a financiar vêm do Fluxo) |
| Base do ROI | Capital próprio total: tudo que sai do bolso (parcelas do Fluxo) **+ decoração/mobília** |
| Impostos | Editáveis; padrão Holding 9%, PF 27% |
| Design | Design system Vitacon (`~/vitacon-design-system`), referência "ON PAULISTA" |
| Temas | Claro **e** escuro (toggle mantido), ambos no padrão Vitacon |
| Marca | Vitacon no site; logo Airbnb no quadro exportável, rodapé Vitacon |
| Valores iniciais | Campos começam zerados (placeholders); sem cenário pré-carregado |
| Público | Denis + time de corretores (ferramenta de trabalho para apresentar a clientes) |
| Comparação de cenários | Não é necessária; histórico simples atual permanece |
| Hospedagem | Continua no Manus; Claude cuida da publicação e do DNS |

## 4. Motor de cálculo v2

Arquivo: `client/src/lib/calculator.ts` (função pura, sem dependências de UI).

### Entradas

Iguais às atuais. `capitalProprio` e `saldoFinanciar` continuam alimentados pelo FluxoContext:

- `fluxo.totalInvestido` = ato + mensais + semestrais + anuais
- `saldoFinanciar = max(0, valorImovel − fluxo.totalInvestido)` (mantido)

Novos campos editáveis: `impostoHolding` (padrão 0,09) e `impostoPF` (padrão 0,27).

### Fórmulas

```
valorPorM2            = valorImovel / areaM2
totalUnidade          = valorImovel + mobilia          ← CORRIGIDO (antes ignorava mobília)
capitalProprioTotal   = fluxo.totalInvestido + mobilia ← CORRIGIDO (base do ROI)

receitaBruta          = diaria × diasOcupacao
adminSeguro           = receitaBruta × taxaAdminSeguro          (padrão 15%)
taxaPlataformaValor   = receitaBruta × taxaPlataforma           (padrão 3%)
custoLimpezaMensal    = custoLimpeza × checkInsMes
gestaoValor           = receitaBruta × taxaGestao               (padrão 0)
parcelaFinanciamento  = PMT(taxaJurosMensal, prazoMeses, saldoFinanciar)   // Price, = PGTO da planilha

totalDespesas         = condominio + iptuMensal + wifi + agua + luz
                      + adminSeguro + gestaoValor
                      + taxaPlataformaValor + custoLimpezaMensal
                      + parcelaFinanciamento

rendaLiquida          = receitaBruta − totalDespesas
rendaHolding          = rendaLiquida × (1 − impostoHolding)
rendaPF               = rendaLiquida × (1 − impostoPF)

retornoCapitalAM      = rendaLiquida / capitalProprioTotal × 100     ← base corrigida
retornoCapitalAA      = retornoCapitalAM × 12                        (anualização linear, como a planilha)
retornoPatrimonioAM   = rendaLiquida / (valorImovel + mobilia) × 100 ← CORRIGIDO
retornoPatrimonioAA   = retornoPatrimonioAM × 12
(variantes Holding e PF das quatro métricas usam rendaHolding/rendaPF no numerador)

// Breakeven operacional (mantido)
despesasFixas         = condominio + iptuMensal + wifi + agua + luz + parcelaFinanciamento + custoLimpezaMensal
percVariavel          = taxaAdminSeguro + taxaGestao + taxaPlataforma
diasBreakeven         = ceil( despesasFixas / ((1 − percVariavel) × diaria) )

// Breakeven do investimento (base corrigida)
mesesRecuperacao      = capitalProprioTotal / rendaLiquida   (e variantes Holding/PF)
```

### Regras de exibição

- Divisões protegidas: se o denominador for 0, o resultado correspondente exibe **"—"** (nunca NaN, Infinity ou 0 enganoso).
- Resultados só aparecem com números quando `receitaBruta > 0`; antes disso os cards mostram estado vazio ("Preencha os dados do imóvel").
- Formatação: R$ pt-BR sem centavos nos cards, com centavos no quadro exportável; percentuais com vírgula e 2 casas.

### Testes (novo)

- Vitest, arquivo `client/src/lib/calculator.test.ts`.
- Gabarito 1 — planilha NILSON-RENATO: valor 477.000, capital 280.000, saldo 197.000, taxa 0,9% a.m., 360 meses; conferir PGTO, renda líquida, Holding/PF e retornos contra os valores da planilha.
- Gabarito 2 — cenário do site atual (93.576 pagos + 40.000 mobília → base 133.576).
- Casos de borda: tudo zerado, taxa 0, prazo 0, saldo 0.

## 5. UX / UI — design system Vitacon

### Tokens (fonte: ~/vitacon-design-system)

- Cores base: `--vit-blue #2800FF`, `--vit-ink #0A0A0B`, `--vit-black #000`, `--vit-white #FFF`, apoio `--olive #4A4A35`, `--wood #7C5A38`.
- Semânticas: verde para resultado positivo, âmbar para despesas, vermelho para negativo (tons definidos por tema, contraste AA).
- Tipografia: **ITC Avant Garde Gothic** (fonte oficial Vitacon, OTFs fornecidos pelo Denis em `~/Desktop/VITACON/ITC Avant Garde Gothic/`), convertida para WOFF2 e embutida no projeto:
  - **Demi** — títulos e headings
  - **Bold** — números grandes / display
  - **Medium** — botões e ênfase
  - **Book** — texto e UI
  - Condensados e oblíquos: fora do escopo.
  - **JetBrains Mono** (via `@fontsource`) apenas onde monospace é funcional: números animados, tabelas e labels uppercase pequenos. Se o Avant Garde oferecer dígitos tabulares (`tnum`), o mono é dispensado.
  - Validar cobertura de acentos pt-BR das versões CE (Book/Demi) na implementação; fallback stack: `"ITC Avant Garde Gothic", "Century Gothic", Futura, sans-serif`.
- Todos os tokens em CSS variables no `index.css`, tema trocado por classe no `<html>` (`.dark`). Fim das cores oklch hardcoded em componentes.

### Temas

- **Claro (padrão)**: fundo branco, cards brancos com borda fina `#E5E5E5`, azul #2800FF em botões/destaques/links, texto ink.
- **Escuro**: fundo `#0A0A0B`, superfícies `#141414`/`#1F1F1F`, texto branco/`#CCC`, acento azul clareado (ex.: `#6E5CFF`, ajustado para contraste AA sobre fundo escuro — o #2800FF puro some no escuro).
- Toggle mantido no header; preferência persistida (comportamento atual do ThemeContext).

### Layout — página Calculadora

- Header: logo Vitacon (SVG da pasta do DS), navegação Calculadora / Fluxo de Pagamento, toggle de tema.
- Hero compacto: título em Archivo Expanded, uma linha de subtítulo; sem blob de luz, sem seção alta.
- Grid de duas colunas (desktop ≥1024px): **inputs à esquerda (~40%)** agrupados em cards (Ficha Técnica, Ocupação & Receita, Investimento, Custos Fixos, Impostos); **resultados à direita (~60%) com `position: sticky`** — corretor altera input e vê números atualizarem sem rolar.
- Resultados: cards de renda líquida mensal/anual + retorno a.m./a.a., variantes fiscais (Lucro/Holding/PF), composição da renda, breakeven operacional, breakeven do investimento, quadro exportável.
- Mobile: colunas empilham; barra fixa no rodapé com os 3 números-chave (renda líquida/mês, retorno a.m., retorno a.a.) que rola até os resultados ao tocar.
- Animações: remover `whileInView`/fade-ins que escondem conteúdo (bug da página preta). Permanecem apenas transições de números (contador atual) e micro-hovers.

### Página Fluxo de Pagamento

- Funcionalidade 100% intacta (sliders, tabela de parcelas editável, gráfico SAC, sync com a calculadora).
- Reskin completo com os mesmos tokens (dois temas). Gráfico SVG recolorido pelos tokens.

## 6. Quadro exportável (PNG)

- Logo do Airbnb salvo em `client/public/airbnb-logo.svg` (asset local — nunca mais quebra).
- Layout claro: logo Airbnb no topo, nome do empreendimento, "Total investido" em destaque, blocos: ocupação → receita bruta → despesas (maior→menor) → renda líquida mensal/anual → retornos (a.m./a.a. sobre capital e sobre patrimônio).
- Rodapé discreto: wordmark Vitacon + data da simulação.
- Exportação `html-to-image` mantida (pixelRatio 2). O quadro exporta sempre em fundo branco, independente do tema ativo do site (peça para WhatsApp do cliente).

## 7. Arquitetura de código

```
client/src/
  lib/calculator.ts          — motor v2 (puro) + calculator.test.ts
  styles/tokens.css          — CSS variables Vitacon (2 temas)
  components/calculadora/
    InputsPanel.tsx          — cards de entrada
    ResultadosPanel.tsx      — coluna sticky de resultados
    FiscalCards.tsx          — Lucro / Holding / PF
    ComposicaoRenda.tsx      — barras de composição
    BreakevenCards.tsx       — operacional + investimento
    QuadroRentabilidade.tsx  — quadro exportável (refeito com tokens)
  pages/Home.tsx             — orquestração enxuta (~150 linhas)
  pages/Fluxo.tsx            — reskin, lógica intacta
```

- Contexts (Fluxo, Cenarios, Theme) mantidos; apenas `capitalProprioTotal` passa a incluir mobília no ponto único de cálculo.
- `pnpm check` (tsc) e `pnpm test` (vitest) verdes como critério de pronto.

## 8. Entrega e publicação

1. Trabalho em branch `redesign-vitacon` no clone `~/Code/airbnb-calc`; commits por etapa (cálculo → tokens/tema → componentes → quadro → fluxo).
2. Verificação local com o site rodando (screenshots nos dois temas, desktop e mobile) antes de considerar pronto.
3. Push para `github.com/denisbugatti/airbnb-calc` (merge na main após aprovação do Denis).
4. **Publicação (Claude executa, com Denis logado no navegador)**:
   - Atualizar o projeto no Manus com o código novo e publicar (via Chrome com a sessão do Denis).
   - **DNS**: airbnbcalculadora.com.br está sem registros (nameservers a/b.auto.dns.br). Configurar no painel do registro.br os apontamentos exigidos pelo Manus (CNAME/A do domínio para o host de publicação).
   - Fallback, se o Manus travar a atualização ou o domínio custom: deploy estático na Vercel conectado ao GitHub e DNS apontado para lá — decidido com o Denis na hora.

## 9. Fora de escopo (desta fase)

- Comparação de cenários lado a lado (estilo abas da planilha).
- Captura de leads / uso público por visitantes.
- Financiamento SAC na calculadora (parcela segue Price/PGTO como a planilha; o gráfico SAC do Fluxo permanece como está).
- Autenticação, banco de dados, multiusuário.
