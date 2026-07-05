# Séries — Condição de Pagamento (v2 do Fluxo)

Pedido do Denis (2026-07-05): recriar totalmente a criação do fluxo de pagamento
no modelo "Condição de pagamento" do sistema de vendas (screenshot de referência).

## Modelo (FluxoContext v2)

```ts
type TipoSerie = "ATO" | "SINAL" | "MENSAL" | "ANUAL" | "SEMESTRAL" | "DECOR"
  | "FINANCIAMENTO" | "UNICA" | "ADIMPLENCIA PREMIADA" | "DACAO IMOVEL" | "PERIODICIDADE";
interface Serie {
  id: string;            // uid
  tipo: TipoSerie;
  parcelas: number;      // qtd de parcelas
  forma: "valor" | "percentual"; // percentual = % do valor do imóvel (total da série)
  valor: number;         // por parcela quando forma=valor; % total quando percentual
  primeiroVenc: string;  // "Jul/2026"
}
```

- `totalInvestido` = Σ séries exceto FINANCIAMENTO e DECOR (valor total = parcelas × valor, ou % × valorImovel)
- DECOR → sincroniza `calc.mobilia`
- `financiamento` = série FINANCIAMENTO (se existir) senão `max(0, valorImovel − totalInvestido)`
- Sync com a calculadora (capitalProprio/saldoFinanciar) igual hoje — manter API `results.totalInvestido/financiamento`
- Padrão inicial: 1 série ATO, forma percentual, 10%, 2 parcelas, venc. mês atual+? (Jul/2026 style), editável
- Compat: cenários/links antigos (percentualAto/ato/anuais...) → converter para séries no decode (merge defensivo)

## UI (página Fluxo, estilo brochure preto)

- Substituir o bloco "Parcelas — clique para editar" por tabela "Condição de pagamento":
  colunas Série (dropdown com os tipos acima) · Parcelas · Forma (Valor | % do imóvel) · Valor · 1º Venc. · Ações (↻ recalcular, 🗑 excluir)
- Linhas dark (#0A0A0A, borda #242424), inputs no padrão brochure, mono labels
- Botão "+ ADICIONAR SÉRIE" (azul #2800FF) abre menu com a lista de tipos (screenshot 3)
- ↻ (recalcular): quando forma=percentual, redistribui valor por parcela; quando valor, recalcula o % equivalente
- Cartões-resumo (Total Investido/Financiamento/Valor do Imóvel) permanecem, alimentados pelo novo modelo
- Configurações antigas (sliders % ato, mensais, +/− anuais) SAEM — tudo vira série
- Home: "Capital próprio (via Fluxo)" continua funcionando sem mudanças (mesma API)

## Estado

- Branch redesign-vitacon, 18 commits. Tabela antiga do fluxo já removida.
- Próximo: reescrever FluxoContext.tsx (manter exports usados por Home/shareLink), depois editor na Fluxo.tsx, typecheck+testes, screenshot, commit.
