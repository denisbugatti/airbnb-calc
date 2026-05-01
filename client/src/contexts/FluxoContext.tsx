/**
 * FluxoContext — Contexto compartilhado entre Fluxo de Pagamento e Calculadora
 * Sincroniza: Total Investido → Capital Próprio | Financiamento → Saldo a Financiar
 * Sincronização bidirecional do Valor do Imóvel via callback registrado
 */

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

export interface ParcelaAto {
  label: string;   // ex: "ATO", "SINAL", "ATO 2/3"
  mes: string;     // ex: "Maio/2026"
  valor: number;
}

export interface ParcelaAnual {
  mes: string;     // ex: "Dez/2026"
  valor: number;
}

export interface ParcelaSemestral {
  mes: string;     // ex: "Nov/2026"
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

  // Semestrais
  semestrais: ParcelaSemestral[]; // array de parcelas semestrais (0 a N)

  // Anuais
  anuais: ParcelaAnual[];       // array de parcelas anuais (0 a N)

  // Decoração
  decoracao: number;

  // Valor do imóvel (espelhado da calculadora)
  valorImovel: number;
}

export interface FluxoResults {
  totalAto: number;
  totalMensais: number;
  totalSemestrais: number;
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
  semestrais: [],
  anuais: buildAnuais(2, defaultValorImovel),
  decoracao: 40_000,
  valorImovel: defaultValorImovel,
};

function calcularFluxo(inputs: FluxoInputs): FluxoResults {
  const totalAto = inputs.ato.reduce((s, p) => s + p.valor, 0);
  const totalMensais = inputs.valorMensal * inputs.numMensais;
  const totalSemestrais = (inputs.semestrais ?? []).reduce((s, p) => s + p.valor, 0);
  const totalAnuais = inputs.anuais.reduce((s, p) => s + p.valor, 0);
  // Decoração NÃO entra na base do ROI — apenas informativa na tabela
  const totalInvestido = totalAto + totalMensais + totalSemestrais + totalAnuais;
  const financiamento = Math.max(0, inputs.valorImovel - totalInvestido);
  return { totalAto, totalMensais, totalSemestrais, totalAnuais, totalInvestido, financiamento };
}

interface FluxoContextType {
  fluxo: FluxoInputs;
  results: FluxoResults;
  nomeEmpreendimento: string;
  setNomeEmpreendimento: (nome: string) => void;
  setFluxo: (fn: (prev: FluxoInputs) => FluxoInputs) => void;
  updateAto: (percentual: number, parcelas: number) => void;
  updateParcelaAtoMes: (idx: number, mes: string) => void;
  updateParcelaAtoValor: (idx: number, valor: number) => void;
  updateAnualMes: (idx: number, mes: string) => void;
  updateAnualValor: (idx: number, valor: number) => void;
  addAnual: () => void;
  removeAnual: () => void;
  removeAnualAt: (idx: number) => void;
  reorderAnuais: (fromIdx: number, toIdx: number) => void;
  // Semestrais
  updateSemestralMes: (idx: number, mes: string) => void;
  updateSemestralValor: (idx: number, valor: number) => void;
  addSemestral: () => void;
  removeSemestral: () => void;
  removeSemestralAt: (idx: number) => void;
  reorderSemestrais: (fromIdx: number, toIdx: number) => void;
  /** Chamado pela Calculadora para sincronizar o valor do imóvel → Fluxo */
  syncValorImovel: (valor: number) => void;
  /** Chamado pelo Fluxo para sincronizar o valor do imóvel → Calculadora */
  syncValorImovelParaCalc: (valor: number) => void;
  /** Registra o callback que a Calculadora usa para receber atualizações do Fluxo */
  registerValorImovelCallback: (cb: (v: number) => void) => void;
}

const FluxoContext = createContext<FluxoContextType | null>(null);

export function FluxoProvider({ children }: { children: ReactNode }) {
  const [fluxo, setFluxoState] = useState<FluxoInputs>(defaultFluxo);
  const [nomeEmpreendimento, setNomeEmpreendimento] = useState("");

  // Callback registrado pelo Home.tsx para receber atualizações do Fluxo
  const calcCallbackRef = useRef<((v: number) => void) | null>(null);

  const registerValorImovelCallback = useCallback((cb: (v: number) => void) => {
    calcCallbackRef.current = cb;
  }, []);

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
      const lastMes = prev.anuais.length > 0 ? prev.anuais[prev.anuais.length - 1].mes : mesAtual();
      return {
        ...prev,
        anuais: [...prev.anuais, { mes: proximoMes(lastMes, 12), valor: prev.anuais[0]?.valor ?? 0 }],
      };
    });
  }, []);

  const removeAnual = useCallback(() => {
    setFluxoState((prev) => {
      if (prev.anuais.length === 0) return prev;
      return { ...prev, anuais: prev.anuais.slice(0, -1) };
    });
  }, []);

  const removeAnualAt = useCallback((idx: number) => {
    setFluxoState((prev) => ({
      ...prev,
      anuais: prev.anuais.filter((_, i) => i !== idx),
    }));
  }, []);

  const reorderAnuais = useCallback((fromIdx: number, toIdx: number) => {
    setFluxoState((prev) => {
      const arr = [...prev.anuais];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return { ...prev, anuais: arr };
    });
  }, []);

  // ── Semestrais ──────────────────────────────────────────────────────────────

  const updateSemestralMes = useCallback((idx: number, mes: string) => {
    setFluxoState((prev) => {
      const semestrais = [...(prev.semestrais ?? [])];
      semestrais[idx] = { ...semestrais[idx], mes };
      return { ...prev, semestrais };
    });
  }, []);

  const updateSemestralValor = useCallback((idx: number, valor: number) => {
    setFluxoState((prev) => {
      const semestrais = [...(prev.semestrais ?? [])];
      semestrais[idx] = { ...semestrais[idx], valor };
      return { ...prev, semestrais };
    });
  }, []);

  const addSemestral = useCallback(() => {
    setFluxoState((prev) => {
      const sem = prev.semestrais ?? [];
      const lastMes = sem.length > 0 ? sem[sem.length - 1].mes : mesAtual();
      return {
        ...prev,
        semestrais: [...sem, { mes: proximoMes(lastMes, 6), valor: sem[0]?.valor ?? 0 }],
      };
    });
  }, []);

  const removeSemestral = useCallback(() => {
    setFluxoState((prev) => {
      const sem = prev.semestrais ?? [];
      if (sem.length === 0) return prev;
      return { ...prev, semestrais: sem.slice(0, -1) };
    });
  }, []);

  const removeSemestralAt = useCallback((idx: number) => {
    setFluxoState((prev) => ({
      ...prev,
      semestrais: (prev.semestrais ?? []).filter((_, i) => i !== idx),
    }));
  }, []);

  const reorderSemestrais = useCallback((fromIdx: number, toIdx: number) => {
    setFluxoState((prev) => {
      const arr = [...(prev.semestrais ?? [])];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return { ...prev, semestrais: arr };
    });
  }, []);

  // ── Sync ────────────────────────────────────────────────────────────────────

  /** Chamado pela Calculadora (Home.tsx) — atualiza o Fluxo sem loop */
  const syncValorImovel = useCallback((valor: number) => {
    setFluxoState((prev) => {
      if (prev.valorImovel === valor) return prev;
      return {
        ...prev,
        valorImovel: valor,
        ato: buildAto(prev.percentualAto, prev.parcelasAto, valor),
      };
    });
  }, []);

  /** Chamado pelo Fluxo (Fluxo.tsx) — atualiza o Fluxo E notifica a Calculadora */
  const syncValorImovelParaCalc = useCallback((valor: number) => {
    setFluxoState((prev) => ({
      ...prev,
      valorImovel: valor,
      ato: buildAto(prev.percentualAto, prev.parcelasAto, valor),
    }));
    if (calcCallbackRef.current) {
      calcCallbackRef.current(valor);
    }
  }, []);

  const results = calcularFluxo(fluxo);

  return (
    <FluxoContext.Provider value={{
      fluxo, results, setFluxo,
      nomeEmpreendimento, setNomeEmpreendimento,
      updateAto, updateParcelaAtoMes, updateParcelaAtoValor,
      updateAnualMes, updateAnualValor,
      addAnual, removeAnual, removeAnualAt, reorderAnuais,
      updateSemestralMes, updateSemestralValor,
      addSemestral, removeSemestral, removeSemestralAt, reorderSemestrais,
      syncValorImovel,
      syncValorImovelParaCalc,
      registerValorImovelCallback,
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
