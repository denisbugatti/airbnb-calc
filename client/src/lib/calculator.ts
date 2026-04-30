/**
 * Motor de Cálculo — Calculadora de Rentabilidade Short Stay
 * Baseado na planilha RENTABILIDADE (NILSON - RENATO 1)
 *
 * Cadeia de cálculo:
 * Inputs do Imóvel → Ocupação → Receita Bruta → Despesas → Renda Líquida → Métricas de Retorno
 *
 * Custos fixos: IPTU | Wi-Fi | Água | Luz | Condomínio | Administração+Seguro | Financiamento
 */

export interface CalculatorInputs {
  // === FICHA TÉCNICA ===
  areaM2: number;           // Área do imóvel em m²
  valorImovel: number;      // Valor do imóvel (R$)
  mobilia: number;          // Valor da mobília e decoração (R$)

  // === OCUPAÇÃO ===
  diaria: number;           // Valor da diária (R$)
  diasOcupacao: number;     // Dias de ocupação por mês (padrão: 23)

  // === FINANCIAMENTO ===
  capitalProprio: number;   // Capital próprio investido (R$) — base do Cash-on-Cash
  saldoFinanciar: number;   // Saldo a financiar (R$)
  taxaJurosMensal: number;  // Taxa de juros mensal decimal (ex: 0.01 = 1% a.m. = 12% a.a.)
  prazoMeses: number;       // Prazo do financiamento em meses (padrão: 360)

  // === DESPESAS FIXAS ===
  condominio: number;       // Condomínio mensal (R$)
  iptuMensal: number;       // IPTU mensal (R$)
  wifi: number;             // Wi-Fi mensal (R$)
  agua: number;             // Água mensal (R$)
  luz: number;              // Luz/Energia mensal (R$)
  taxaAdminSeguro: number;  // Administração + Seguro (% sobre receita bruta, padrão: 10%)

  // === AIRBNB ESPECÍFICO ===
  taxaPlataforma: number;   // Taxa da plataforma Airbnb (padrão: 3% = 0.03)
  custoLimpeza: number;     // Custo de limpeza por check-in (R$)
  checkInsMes: number;      // Número de check-ins por mês (padrão: 4)
  taxaGestao: number;       // Taxa do property manager (padrão: 0 = sem gestor)
}

export interface CalculatorResults {
  // === FICHA TÉCNICA ===
  valorPorM2: number;
  totalUnidade: number;

  // === RECEITA ===
  receitaBrutaMensal: number;
  taxaPlataformaValor: number;
  custoLimpezaMensal: number;
  receitaLiquidaPlataforma: number;

  // === DESPESAS DETALHADAS ===
  adminSeguro: number;
  gestaoValor: number;
  parcelaFinanciamento: number;
  totalDespesasFixas: number;   // condominio + iptu + wifi + agua + luz + parcela
  totalDespesas: number;        // todas as despesas

  // === RESULTADO ===
  rendaMensalLiquida: number;
  rendaHolding: number;         // rendaLiquida * 0.94
  rendaPF: number;              // rendaLiquida * 0.73

  // === MÉTRICAS DE RETORNO ===
  ganhoFinanceiroMensal: number;
  rentabilidadeAnual: number;
  rentabilidadeHoldingAnual: number;
  rentabilidadePFAnual: number;

  // === BREAKEVEN ===
  diasBreakeven: number;
  ocupacaoBreakeven: number;
}

/**
 * Função PMT — equivalente ao PGTO do Excel/Sheets
 */
export function pmt(taxa: number, nper: number, pv: number): number {
  if (pv === 0) return 0;
  if (taxa === 0) return pv / nper;
  return (pv * taxa * Math.pow(1 + taxa, nper)) / (Math.pow(1 + taxa, nper) - 1);
}

/**
 * Calcula todos os resultados da calculadora
 */
export function calcular(inputs: CalculatorInputs): CalculatorResults {
  const {
    areaM2, valorImovel, mobilia,
    diaria, diasOcupacao,
    capitalProprio, saldoFinanciar, taxaJurosMensal, prazoMeses,
    condominio, iptuMensal, wifi, agua, luz, taxaAdminSeguro,
    taxaPlataforma, custoLimpeza, checkInsMes, taxaGestao,
  } = inputs;

  // === FICHA TÉCNICA ===
  const valorPorM2 = areaM2 > 0 ? valorImovel / areaM2 : 0;
  const totalUnidade = valorImovel; // Mobília não entra no Total da Unidade

  // === RECEITA ===
  const receitaBrutaMensal = diaria * diasOcupacao;
  const taxaPlataformaValor = receitaBrutaMensal * taxaPlataforma;
  const custoLimpezaMensal = custoLimpeza * checkInsMes;
  const receitaLiquidaPlataforma = receitaBrutaMensal - taxaPlataformaValor;

  // === DESPESAS ===
  const adminSeguro = receitaBrutaMensal * taxaAdminSeguro;
  const gestaoValor = receitaBrutaMensal * taxaGestao;
  const parcelaFinanciamento = pmt(taxaJurosMensal, prazoMeses, saldoFinanciar);

  // Despesas fixas mensais
  const totalDespesasFixas = condominio + iptuMensal + wifi + agua + luz + parcelaFinanciamento;

  const totalDespesas =
    condominio + iptuMensal + wifi + agua + luz +
    adminSeguro + gestaoValor +
    taxaPlataformaValor + custoLimpezaMensal +
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
    ? (rendaHolding * 100 / capitalProprio) * 12 : 0;
  const rentabilidadePFAnual = capitalProprio > 0
    ? (rendaPF * 100 / capitalProprio) * 12 : 0;

  // === BREAKEVEN ===
  const despesasFixasBreakeven = condominio + iptuMensal + wifi + agua + luz + parcelaFinanciamento + custoLimpezaMensal;
  const percentualVariavel = taxaAdminSeguro + taxaGestao + taxaPlataforma;
  const receitaNecessaria = percentualVariavel < 1
    ? despesasFixasBreakeven / (1 - percentualVariavel) : 0;
  const diasBreakeven = diaria > 0 ? Math.ceil(receitaNecessaria / diaria) : 0;
  const ocupacaoBreakeven = (diasBreakeven / 30) * 100;

  return {
    valorPorM2, totalUnidade,
    receitaBrutaMensal, taxaPlataformaValor, custoLimpezaMensal, receitaLiquidaPlataforma,
    adminSeguro, gestaoValor, parcelaFinanciamento, totalDespesasFixas, totalDespesas,
    rendaMensalLiquida, rendaHolding, rendaPF,
    ganhoFinanceiroMensal, rentabilidadeAnual, rentabilidadeHoldingAnual, rentabilidadePFAnual,
    diasBreakeven, ocupacaoBreakeven,
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

export const defaultInputs: CalculatorInputs = {
  areaM2: 29,
  valorImovel: 477_000,
  mobilia: 40_000,
  diaria: 650,
  diasOcupacao: 23,
  capitalProprio: 280_000,
  saldoFinanciar: 197_000,
  taxaJurosMensal: 0.01,   // 12% a.a. = 1% a.m.
  prazoMeses: 360,
  condominio: 700,
  iptuMensal: 290,
  wifi: 120,
  agua: 80,
  luz: 150,
  taxaAdminSeguro: 0.10,
  taxaPlataforma: 0.03,
  custoLimpeza: 120,
  checkInsMes: 4,
  taxaGestao: 0,
};
