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
