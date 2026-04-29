/**
 * FluxoContext — Contexto compartilhado entre Fluxo de Pagamento e Calculadora
 * Sincroniza: Total Investido → Capital Próprio | Financiamento → Saldo a Financiar
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface ParcelaAto {
  label: string;   // ex: "ATO", "SINAL", "ATO 2/3"
  mes: string;     // ex: "Maio/2026"
  valor: number;
}

export interface ParcelaAnual {
  mes: string;     // ex: "Dez/2026"
  valor: number;
}

export interface FluxoInputs {
  // Ato
  percentualAto: number;        // % do valor do imóvel (padrão 13.80, mín 9.8)
  parcelasAto: number;          // 1 a 4
  ato: ParcelaAto[];            // array dinâmico de parcelas do ato

  // Mensais
  valorMensal: number;          // valor por parcela mensal
  numMensais: number;           // 25 a 37 meses

  // Anuais
  anuais: ParcelaAnual[];       // array de parcelas anuais (2 ou 3)

  // Decoração
  decoracao: number;

  // Valor do imóvel (espelhado da calculadora)
  valorImovel: number;
}

export interface FluxoResults {
  totalAto: number;
  totalMensais: number;
  totalAnuais: number;
  totalInvestido: number;       // base do ROI
  financiamento: number;        // valorImovel - totalInvestido
}

const MESES = [
  "Jan","Fev","Mar","Abr","Mai","Jun",
  "Jul","Ago","Set","Out","Nov","Dez"
];

function mesAtual(): string {
  const d = new Date();
  return `${MESES[d.getMonth()]}/${d.getFullYear()}`;
}

function proximoMes(mesStr: string, offset: number): string {
  const parts = mesStr.split("/");
  if (parts.length !== 2) return mesStr;
  const idx = MESES.indexOf(parts[0]);
  const ano = parseInt(parts[1]);
  if (idx === -1 || isNaN(ano)) return mesStr;
  const total = idx + offset;
  const novoMes = total % 12;
  const novoAno = ano + Math.floor(total / 12);
  return `${MESES[novoMes]}/${novoAno}`;
}

function buildAto(percentual: number, parcelas: number, valorImovel: number): ParcelaAto[] {
  const totalAto = (percentual / 100) * valorImovel;
  const valorParcela = parcelas > 0 ? totalAto / parcelas : totalAto;
  const inicio = mesAtual();
  return Array.from({ length: parcelas }, (_, i) => ({
    label: i === 0 ? "ATO" : `SINAL ${i}`,
    mes: proximoMes(inicio, i),
    valor: valorParcela,
  }));
}

function buildAnuais(qtd: number, valorImovel: number): ParcelaAnual[] {
  const valorParcela = (valorImovel * 0.03) / qtd;
  const inicio = mesAtual();
  return Array.from({ length: qtd }, (_, i) => ({
    mes: proximoMes(inicio, 12 * (i + 1)),
    valor: valorParcela,
  }));
}

const defaultValorImovel = 477_000;

const defaultFluxo: FluxoInputs = {
  percentualAto: 13.80,
  parcelasAto: 2,
  ato: buildAto(13.80, 2, defaultValorImovel),
  valorMensal: 560,
  numMensais: 24,
  anuais: buildAnuais(2, defaultValorImovel),
  decoracao: 40_000,
  valorImovel: defaultValorImovel,
};

function calcularFluxo(inputs: FluxoInputs): FluxoResults {
  const totalAto = inputs.ato.reduce((s, p) => s + p.valor, 0);
  const totalMensais = inputs.valorMensal * inputs.numMensais;
  const totalAnuais = inputs.anuais.reduce((s, p) => s + p.valor, 0);
  const totalInvestido = totalAto + totalMensais + totalAnuais + inputs.decoracao;
  const financiamento = Math.max(0, inputs.valorImovel - totalInvestido);
  return { totalAto, totalMensais, totalAnuais, totalInvestido, financiamento };
}

interface FluxoContextType {
  fluxo: FluxoInputs;
  results: FluxoResults;
  setFluxo: (fn: (prev: FluxoInputs) => FluxoInputs) => void;
  updateAto: (percentual: number, parcelas: number) => void;
  updateParcelaAtoMes: (idx: number, mes: string) => void;
  updateParcelaAtoValor: (idx: number, valor: number) => void;
  updateAnualMes: (idx: number, mes: string) => void;
  updateAnualValor: (idx: number, valor: number) => void;
  addAnual: () => void;
  removeAnual: () => void;
  syncValorImovel: (valor: number) => void;
}

const FluxoContext = createContext<FluxoContextType | null>(null);

export function FluxoProvider({ children }: { children: ReactNode }) {
  const [fluxo, setFluxoState] = useState<FluxoInputs>(defaultFluxo);

  const setFluxo = useCallback((fn: (prev: FluxoInputs) => FluxoInputs) => {
    setFluxoState(fn);
  }, []);

  const updateAto = useCallback((percentual: number, parcelas: number) => {
    setFluxoState((prev) => ({
      ...prev,
      percentualAto: percentual,
      parcelasAto: parcelas,
      ato: buildAto(percentual, parcelas, prev.valorImovel),
    }));
  }, []);

  const updateParcelaAtoMes = useCallback((idx: number, mes: string) => {
    setFluxoState((prev) => {
      const ato = [...prev.ato];
      ato[idx] = { ...ato[idx], mes };
      return { ...prev, ato };
    });
  }, []);

  const updateParcelaAtoValor = useCallback((idx: number, valor: number) => {
    setFluxoState((prev) => {
      const ato = [...prev.ato];
      ato[idx] = { ...ato[idx], valor };
      return { ...prev, ato };
    });
  }, []);

  const updateAnualMes = useCallback((idx: number, mes: string) => {
    setFluxoState((prev) => {
      const anuais = [...prev.anuais];
      anuais[idx] = { ...anuais[idx], mes };
      return { ...prev, anuais };
    });
  }, []);

  const updateAnualValor = useCallback((idx: number, valor: number) => {
    setFluxoState((prev) => {
      const anuais = [...prev.anuais];
      anuais[idx] = { ...anuais[idx], valor };
      return { ...prev, anuais };
    });
  }, []);

  const addAnual = useCallback(() => {
    setFluxoState((prev) => {
      if (prev.anuais.length >= 3) return prev;
      const lastMes = prev.anuais.length > 0 ? prev.anuais[prev.anuais.length - 1].mes : mesAtual();
      return {
        ...prev,
        anuais: [...prev.anuais, { mes: proximoMes(lastMes, 12), valor: prev.anuais[0]?.valor ?? 0 }],
      };
    });
  }, []);

  const removeAnual = useCallback(() => {
    setFluxoState((prev) => {
      if (prev.anuais.length <= 1) return prev;
      return { ...prev, anuais: prev.anuais.slice(0, -1) };
    });
  }, []);

  const syncValorImovel = useCallback((valor: number) => {
    setFluxoState((prev) => ({
      ...prev,
      valorImovel: valor,
      ato: buildAto(prev.percentualAto, prev.parcelasAto, valor),
    }));
  }, []);

  const results = calcularFluxo(fluxo);

  return (
    <FluxoContext.Provider value={{
      fluxo, results, setFluxo,
      updateAto, updateParcelaAtoMes, updateParcelaAtoValor,
      updateAnualMes, updateAnualValor,
      addAnual, removeAnual,
      syncValorImovel,
    }}>
      {children}
    </FluxoContext.Provider>
  );
}

export function useFluxo() {
  const ctx = useContext(FluxoContext);
  if (!ctx) throw new Error("useFluxo must be used within FluxoProvider");
  return ctx;
}

export { calcularFluxo, buildAto, buildAnuais, proximoMes, mesAtual };
