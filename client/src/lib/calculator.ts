/**
 * Motor de Cálculo — Calculadora de Rentabilidade Short Stay
 * Baseado na planilha RENTABILIDADE (NILSON - RENATO 1)
 *
 * Cadeia de cálculo:
 * Inputs do Imóvel → Ocupação → Receita Bruta → Despesas → Renda Líquida → Métricas de Retorno
 */

export interface CalculatorInputs {
  // === FICHA TÉCNICA ===
  areaM2: number;           // B3 — Área do imóvel em m²
  valorImovel: number;      // B4 — Valor do imóvel (R$)
  mobilia: number;          // B6 — Valor da mobília (R$)

  // === OCUPAÇÃO ===
  diaria: number;           // B10 — Valor da diária (R$)
  diasOcupacao: number;     // B12 — Dias de ocupação por mês (padrão: 23)

  // === FINANCIAMENTO ===
  capitalProprio: number;   // B16 — Capital próprio investido (R$)
  saldoFinanciar: number;   // B17 — Saldo a financiar (calculado ou manual)
  taxaJurosMensal: number;  // Taxa de juros mensal (padrão: 0.9% = 0.009)
  prazoMeses: number;       // Prazo do financiamento em meses (padrão: 360)

  // === DESPESAS OPERACIONAIS ===
  condominio: number;       // B20 — Condomínio mensal (R$)
  iptuMensal: number;       // B21 — IPTU mensal (R$)
  taxaAdminSeguro: number;  // B22 — % sobre receita bruta (padrão: 10% = 0.10)

  // === AIRBNB ESPECÍFICO (expansão da planilha original) ===
  taxaPlataforma: number;   // Taxa da plataforma Airbnb (padrão: 3% = 0.03)
  custoLimpeza: number;     // Custo de limpeza por check-in (R$)
  checkInsMes: number;      // Número de check-ins por mês (padrão: 4)
  taxaGestao: number;       // Taxa do property manager (padrão: 0 = sem gestor)
}

export interface CalculatorResults {
  // === FICHA TÉCNICA ===
  valorPorM2: number;       // B5 = B4/B3
  totalUnidade: number;     // B7 = mobilia + valorImovel

  // === RECEITA ===
  receitaBrutaMensal: number; // B14 = diaria * diasOcupacao
  taxaPlataformaValor: number; // Taxa Airbnb em R$
  custoLimpezaMensal: number;  // Limpeza total mensal
  receitaLiquidaPlataforma: number; // Receita após taxas da plataforma

  // === DESPESAS ===
  adminSeguro: number;      // B22 = receitaBruta * taxaAdminSeguro
  gestaoValor: number;      // Valor do property manager
  parcelaFinanciamento: number; // B23 = PMT(taxa, prazo, saldo) * -1
  totalDespesas: number;    // B24 = soma de todas as despesas

  // === RESULTADO ===
  rendaMensalLiquida: number;  // B26 = receitaBruta - totalDespesas
  rendaHolding: number;        // C26 = rendaLiquida * 0.94
  rendaPF: number;             // D26 = rendaLiquida * 0.73

  // === MÉTRICAS DE RETORNO ===
  ganhoFinanceiroMensal: number;  // B28 = rendaLiquida * 100 / capitalProprio
  rentabilidadeAnual: number;     // B29 = ganhoMensal * 12
  rentabilidadeHoldingAnual: number;
  rentabilidadePFAnual: number;

  // === BREAKEVEN ===
  diasBreakeven: number;       // Mínimo de dias para cobrir despesas
  ocupacaoBreakeven: number;   // % de ocupação para breakeven
}

/**
 * Função PMT — equivalente ao PGTO do Excel/Sheets
 * Calcula a parcela de um financiamento Price
 * @param taxa  Taxa de juros por período (ex: 0.009 para 0.9% a.m.)
 * @param nper  Número de períodos (ex: 360 meses)
 * @param pv    Valor presente / saldo a financiar (ex: 280000)
 * @returns     Parcela mensal (valor positivo)
 */
export function pmt(taxa: number, nper: number, pv: number): number {
  if (pv === 0) return 0;
  if (taxa === 0) return pv / nper;
  const parcela = (pv * taxa * Math.pow(1 + taxa, nper)) / (Math.pow(1 + taxa, nper) - 1);
  return parcela;
}

/**
 * Calcula todos os resultados da calculadora
 */
export function calcular(inputs: CalculatorInputs): CalculatorResults {
  const {
    areaM2,
    valorImovel,
    mobilia,
    diaria,
    diasOcupacao,
    capitalProprio,
    saldoFinanciar,
    taxaJurosMensal,
    prazoMeses,
    condominio,
    iptuMensal,
    taxaAdminSeguro,
    taxaPlataforma,
    custoLimpeza,
    checkInsMes,
    taxaGestao,
  } = inputs;

  // === FICHA TÉCNICA ===
  const valorPorM2 = areaM2 > 0 ? valorImovel / areaM2 : 0;
  const totalUnidade = valorImovel + mobilia;

  // === RECEITA ===
  const receitaBrutaMensal = diaria * diasOcupacao;
  const taxaPlataformaValor = receitaBrutaMensal * taxaPlataforma;
  const custoLimpezaMensal = custoLimpeza * checkInsMes;
  const receitaLiquidaPlataforma = receitaBrutaMensal - taxaPlataformaValor;

  // === DESPESAS ===
  const adminSeguro = receitaBrutaMensal * taxaAdminSeguro;
  const gestaoValor = receitaBrutaMensal * taxaGestao;
  const parcelaFinanciamento = pmt(taxaJurosMensal, prazoMeses, saldoFinanciar);

  const totalDespesas =
    condominio +
    iptuMensal +
    adminSeguro +
    gestaoValor +
    taxaPlataformaValor +
    custoLimpezaMensal +
    parcelaFinanciamento;

  // === RESULTADO ===
  const rendaMensalLiquida = receitaBrutaMensal - totalDespesas;
  const rendaHolding = rendaMensalLiquida * 0.94;
  const rendaPF = rendaMensalLiquida * 0.73;

  // === MÉTRICAS DE RETORNO ===
  const ganhoFinanceiroMensal =
    capitalProprio > 0 ? (rendaMensalLiquida * 100) / capitalProprio : 0;
  const rentabilidadeAnual = ganhoFinanceiroMensal * 12;
  const rentabilidadeHoldingAnual = capitalProprio > 0
    ? (rendaHolding * 100 / capitalProprio) * 12
    : 0;
  const rentabilidadePFAnual = capitalProprio > 0
    ? (rendaPF * 100 / capitalProprio) * 12
    : 0;

  // === BREAKEVEN ===
  // Despesas fixas (não dependem da receita)
  const despesasFixas = condominio + iptuMensal + parcelaFinanciamento + custoLimpezaMensal;
  // Despesas variáveis como % da receita
  const percentualVariavel = taxaAdminSeguro + taxaGestao + taxaPlataforma;
  // Receita necessária para cobrir todas as despesas
  const receitaNecessaria = percentualVariavel < 1
    ? despesasFixas / (1 - percentualVariavel)
    : 0;
  const diasBreakeven = diaria > 0 ? Math.ceil(receitaNecessaria / diaria) : 0;
  const ocupacaoBreakeven = (diasBreakeven / 30) * 100;

  return {
    valorPorM2,
    totalUnidade,
    receitaBrutaMensal,
    taxaPlataformaValor,
    custoLimpezaMensal,
    receitaLiquidaPlataforma,
    adminSeguro,
    gestaoValor,
    parcelaFinanciamento,
    totalDespesas,
    rendaMensalLiquida,
    rendaHolding,
    rendaPF,
    ganhoFinanceiroMensal,
    rentabilidadeAnual,
    rentabilidadeHoldingAnual,
    rentabilidadePFAnual,
    diasBreakeven,
    ocupacaoBreakeven,
  };
}

/**
 * Formata valor como moeda BRL
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formata valor como percentual
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals).replace(".", ",")}%`;
}

/**
 * Valores padrão da calculadora (baseados na planilha NILSON - RENATO 1)
 */
export const defaultInputs: CalculatorInputs = {
  areaM2: 29,
  valorImovel: 477_000,
  mobilia: 40_000,
  diaria: 650,
  diasOcupacao: 23,
  capitalProprio: 280_000,
  saldoFinanciar: 197_000,
  taxaJurosMensal: 0.009,
  prazoMeses: 360,
  condominio: 700,
  iptuMensal: 290,
  taxaAdminSeguro: 0.10,
  taxaPlataforma: 0.03,
  custoLimpeza: 120,
  checkInsMes: 4,
  taxaGestao: 0,
};
