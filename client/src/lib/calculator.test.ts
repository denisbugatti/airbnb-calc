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
    expect(r.rendaHolding).toBeCloseTo(r.rendaMensalLiquida * 0.91, 6);
    expect(r.rendaPF).toBeCloseTo(r.rendaMensalLiquida * 0.73, 6);
  });
  it("imposto customizado (Holding 6% da planilha)", () => {
    const r6 = calcular({ ...cenarioAtual, impostoHolding: 0.06 });
    expect(r6.rendaHolding).toBeCloseTo(r6.rendaMensalLiquida * 0.94, 6);
  });
});

describe("calcular — estados vazios (campos zerados)", () => {
  const r = calcular(defaultInputs);
  it("imóvel/diária zerados; custos fixos e taxas pré-preenchidos", () => {
    expect(defaultInputs.valorImovel).toBe(0);
    expect(defaultInputs.diaria).toBe(0);
    expect(defaultInputs.condominio).toBe(700);
    expect(defaultInputs.iptuMensal).toBe(290);
    expect(defaultInputs.wifi + defaultInputs.agua + defaultInputs.luz).toBe(350);
    expect(defaultInputs.custoLimpeza).toBe(120);
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
