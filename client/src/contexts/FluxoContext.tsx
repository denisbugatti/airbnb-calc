/**
 * FluxoContext — Estado único compartilhado entre Calculadora e Fluxo de Pagamento
 *
 * Todos os campos de CalculatorInputs vivem aqui. Qualquer edição em qualquer
 * aba é imediatamente refletida na outra, sem callbacks ou sincronização manual.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type CalculatorInputs, defaultInputs } from "@/lib/calculator";

export interface ParcelaAto {
  label: string;
  mes: string;
  valor: number;
}

export interface ParcelaAnual {
  mes: string;
  valor: number;
}

export interface ParcelaSemestral {
  mes: string;
  valor: number;
}

/** Séries extras do editor "Condição de pagamento" (ÚNICA, ADIMPLÊNCIA PREMIADA, DAÇÃO IMÓVEL, PERIODICIDADE...) */
export interface SerieExtra {
  id: string;
  tipo: string;
  parcelas: number;
  valor: number;   // por parcela
  mes: string;     // 1º vencimento
}

export interface FluxoInputs {
  percentualAto: number;
  parcelasAto: number;
  ato: ParcelaAto[];
  valorMensal: number;
  numMensais: number;
  mesInicioMensais?: string;
  semestrais: ParcelaSemestral[];
  anuais: ParcelaAnual[];
  extras?: SerieExtra[];
}

export interface FluxoResults {
  totalAto: number;
  totalMensais: number;
  totalSemestrais: number;
  totalAnuais: number;
  totalExtras: number;
  totalInvestido: number;
  financiamento: number;
}

// Tipo do payload de sync legado (mantido para compatibilidade)
export interface SyncPayload {
  valorImovel?: number;
  taxaJurosMensal?: number;
  prazoMeses?: number;
  decoracao?: number;
}

const MESES = [
  "Jan","Fev","Mar","Abr","Mai","Jun",
  "Jul","Ago","Set","Out","Nov","Dez"
];

function mesAtual(): string {
  const d = new Date();
  return `${MESES[d.getMonth()]}/${d.getFullYear()}`;
}

export function proximoMes(mesStr: string, offset: number): string {
  const parts = mesStr.split("/");
  if (parts.length !== 2) return mesStr;
  const idx = MESES.indexOf(parts[0]);
  const ano = parseInt(parts[1]);
  if (idx === -1 || isNaN(ano)) return mesStr;
  const total = idx + offset;
  const novoMes = ((total % 12) + 12) % 12;
  const novoAno = ano + Math.floor(total / 12);
  return `${MESES[novoMes]}/${novoAno}`;
}

export function mesAtualFn(): string { return mesAtual(); }

export function buildAto(percentual: number, parcelas: number, valorImovel: number): ParcelaAto[] {
  const totalAto = (percentual / 100) * valorImovel;
  const valorParcela = parcelas > 0 ? totalAto / parcelas : totalAto;
  const inicio = mesAtual();
  return Array.from({ length: parcelas }, (_, i) => ({
    label: i === 0 ? "ATO" : `SINAL ${i}`,
    mes: proximoMes(inicio, i),
    valor: valorParcela,
  }));
}

export function buildAnuais(qtd: number, valorImovel: number): ParcelaAnual[] {
  const valorParcela = (valorImovel * 0.03) / qtd;
  const inicio = mesAtual();
  return Array.from({ length: qtd }, (_, i) => ({
    mes: proximoMes(inicio, 12 * (i + 1)),
    valor: valorParcela,
  }));
}

function calcularFluxo(fluxo: FluxoInputs, valorImovel: number): FluxoResults {
  const totalAto = fluxo.ato.reduce((s, p) => s + p.valor, 0);
  const totalMensais = fluxo.valorMensal * fluxo.numMensais;
  const totalSemestrais = (fluxo.semestrais ?? []).reduce((s, p) => s + p.valor, 0);
  const totalAnuais = fluxo.anuais.reduce((s, p) => s + p.valor, 0);
  const totalExtras = (fluxo.extras ?? []).reduce((s, e) => s + e.valor * e.parcelas, 0);
  const totalInvestido = totalAto + totalMensais + totalSemestrais + totalAnuais + totalExtras;
  const financiamento = Math.max(0, valorImovel - totalInvestido);
  return { totalAto, totalMensais, totalSemestrais, totalAnuais, totalExtras, totalInvestido, financiamento };
}

const defaultValorImovel = defaultInputs.valorImovel;

const defaultFluxo: FluxoInputs = {
  percentualAto: 10, // Ato fixo: 10% do valor do imóvel
  parcelasAto: 2,
  ato: buildAto(10, 2, defaultValorImovel),
  valorMensal: 560,
  numMensais: 24,
  semestrais: [],
  anuais: buildAnuais(2, defaultValorImovel),
  extras: [],
};

interface SharedContextType {
  // ── Calculadora (estado único) ────────────────────────────────────────────
  calc: CalculatorInputs;
  setCalc: (fn: (prev: CalculatorInputs) => CalculatorInputs) => void;
  setCalcField: (key: keyof CalculatorInputs, value: number) => void;

  // ── Fluxo de Pagamento ────────────────────────────────────────────────────
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
  updateSemestralMes: (idx: number, mes: string) => void;
  updateSemestralValor: (idx: number, valor: number) => void;
  addSemestral: () => void;
  removeSemestral: () => void;
  removeSemestralAt: (idx: number) => void;
  reorderSemestrais: (fromIdx: number, toIdx: number) => void;

  // ── Toggle decoração (compartilhado entre Fluxo e Calculadora) ─────────────
  incluiDecoracao: boolean;
  setIncluiDecoracao: (v: boolean) => void;

  // ── Legado (compatibilidade) ──────────────────────────────────────────────
  syncFromCalc: (payload: SyncPayload) => void;
  syncToCalc: (payload: SyncPayload) => void;
  registerCalcCallback: (cb: (payload: SyncPayload) => void) => void;
  syncValorImovel: (valor: number) => void;
  syncValorImovelParaCalc: (valor: number) => void;
  registerValorImovelCallback: (cb: (v: number) => void) => void;
}

const FluxoContext = createContext<SharedContextType | null>(null);

export function FluxoProvider({ children }: { children: ReactNode }) {
  const [calc, setCalcState] = useState<CalculatorInputs>(defaultInputs);
  const [fluxo, setFluxoState] = useState<FluxoInputs>(defaultFluxo);
  const [nomeEmpreendimento, setNomeEmpreendimento] = useState("");
  const [incluiDecoracao, setIncluiDecoracao] = useState(false);

  // ── Calculadora ──────────────────────────────────────────────────────────

  const setCalc = useCallback((fn: (prev: CalculatorInputs) => CalculatorInputs) => {
    setCalcState(fn);
  }, []);

  const setCalcField = useCallback((key: keyof CalculatorInputs, value: number) => {
    setCalcState((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Fluxo ────────────────────────────────────────────────────────────────

  const setFluxo = useCallback((fn: (prev: FluxoInputs) => FluxoInputs) => {
    setFluxoState(fn);
  }, []);

  const updateAto = useCallback((percentual: number, parcelas: number) => {
    setCalcState((prev) => prev); // garante acesso ao valorImovel atual
    setFluxoState((prev) => ({
      ...prev,
      percentualAto: percentual,
      parcelasAto: parcelas,
      ato: buildAto(percentual, parcelas, calc.valorImovel),
    }));
  }, [calc.valorImovel]);

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
      const novoTotal = sem.length + 1;
      const valorProporcional = Math.round((calc.valorImovel * 0.03) / novoTotal);
      const novoValor = sem.length === 0 ? valorProporcional : sem[0].valor;
      const novasSemestrais = sem.length === 0
        ? [{ mes: proximoMes(lastMes, 6), valor: valorProporcional }]
        : [...sem, { mes: proximoMes(lastMes, 6), valor: novoValor }];
      return { ...prev, semestrais: novasSemestrais };
    });
  }, [calc.valorImovel]);

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

  // ── Legado: sync via payload (mantido para compatibilidade com Fluxo.tsx) ─

  const syncFromCalc = useCallback((payload: SyncPayload) => {
    // No novo modelo, calc já é a fonte única — apenas atualiza campos relevantes
    setCalcState((prev) => {
      const next = { ...prev };
      let changed = false;
      if (payload.valorImovel !== undefined && prev.valorImovel !== payload.valorImovel) {
        next.valorImovel = payload.valorImovel; changed = true;
      }
      if (payload.taxaJurosMensal !== undefined && prev.taxaJurosMensal !== payload.taxaJurosMensal) {
        next.taxaJurosMensal = payload.taxaJurosMensal; changed = true;
      }
      if (payload.prazoMeses !== undefined && prev.prazoMeses !== payload.prazoMeses) {
        next.prazoMeses = payload.prazoMeses; changed = true;
      }
      if (payload.decoracao !== undefined && prev.mobilia !== payload.decoracao) {
        next.mobilia = payload.decoracao; changed = true;
      }
      return changed ? next : prev;
    });
    // Atualiza ato quando valorImovel muda
    if (payload.valorImovel !== undefined) {
      setFluxoState((prev) => ({
        ...prev,
        ato: buildAto(prev.percentualAto, prev.parcelasAto, payload.valorImovel!),
      }));
    }
  }, []);

  const syncToCalc = useCallback((payload: SyncPayload) => {
    // No novo modelo, syncToCalc e syncFromCalc fazem a mesma coisa
    syncFromCalc(payload);
  }, [syncFromCalc]);

  const registerCalcCallback = useCallback((_cb: (payload: SyncPayload) => void) => {
    // No novo modelo, não há mais callbacks — o estado é compartilhado diretamente
    // Mantido para compatibilidade de interface
  }, []);

  const syncValorImovel = useCallback((valor: number) => {
    syncFromCalc({ valorImovel: valor });
  }, [syncFromCalc]);

  const syncValorImovelParaCalc = useCallback((valor: number) => {
    syncFromCalc({ valorImovel: valor });
  }, [syncFromCalc]);

  const registerValorImovelCallback = useCallback((_cb: (v: number) => void) => {
    // Legado — não necessário no novo modelo
  }, []);

  const results = calcularFluxo(fluxo, calc.valorImovel);

  return (
    <FluxoContext.Provider value={{
      calc, setCalc, setCalcField,
      incluiDecoracao, setIncluiDecoracao,
      fluxo, results, setFluxo,
      nomeEmpreendimento, setNomeEmpreendimento,
      updateAto, updateParcelaAtoMes, updateParcelaAtoValor,
      updateAnualMes, updateAnualValor,
      addAnual, removeAnual, removeAnualAt, reorderAnuais,
      updateSemestralMes, updateSemestralValor,
      addSemestral, removeSemestral, removeSemestralAt, reorderSemestrais,
      syncFromCalc, syncToCalc,
      registerCalcCallback,
      syncValorImovel, syncValorImovelParaCalc, registerValorImovelCallback,
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

export { calcularFluxo, mesAtual };
