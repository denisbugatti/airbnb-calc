/**
 * FluxoContext — Contexto compartilhado entre Fluxo de Pagamento e Calculadora
 * Sincroniza bidirecionalmente:
 *   - valorImovel
 *   - taxaJurosMensal
 *   - prazoMeses
 *   - decoracao (mobília)
 *   - capitalProprio / saldoFinanciar (derivados do totalInvestido / financiamento)
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
  percentualAto: number;
  parcelasAto: number;
  ato: ParcelaAto[];

  // Mensais
  valorMensal: number;
  numMensais: number;

  // Semestrais
  semestrais: ParcelaSemestral[];

  // Anuais
  anuais: ParcelaAnual[];

  // Decoração / mobília (sincronizado com Calculadora)
  decoracao: number;

  // Valor do imóvel (sincronizado com Calculadora)
  valorImovel: number;

  // Financiamento (sincronizado com Calculadora)
  taxaJurosMensal: number;   // taxa mensal (ex: 0.009)
  prazoMeses: number;        // prazo em meses (ex: 360)
}

export interface FluxoResults {
  totalAto: number;
  totalMensais: number;
  totalSemestrais: number;
  totalAnuais: number;
  totalInvestido: number;
  financiamento: number;
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
  taxaJurosMensal: 0.10 / 12,  // 10% a.a. → mensal
  prazoMeses: 360,
};

function calcularFluxo(inputs: FluxoInputs): FluxoResults {
  const totalAto = inputs.ato.reduce((s, p) => s + p.valor, 0);
  const totalMensais = inputs.valorMensal * inputs.numMensais;
  const totalSemestrais = (inputs.semestrais ?? []).reduce((s, p) => s + p.valor, 0);
  const totalAnuais = inputs.anuais.reduce((s, p) => s + p.valor, 0);
  const totalInvestido = totalAto + totalMensais + totalSemestrais + totalAnuais;
  const financiamento = Math.max(0, inputs.valorImovel - totalInvestido);
  return { totalAto, totalMensais, totalSemestrais, totalAnuais, totalInvestido, financiamento };
}

// Tipo do callback bidirecional: notifica a Calculadora de múltiplos campos
export interface SyncPayload {
  valorImovel?: number;
  taxaJurosMensal?: number;
  prazoMeses?: number;
  decoracao?: number;
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
  /** Calculadora → Fluxo: atualiza campos sem disparar callback de volta */
  syncFromCalc: (payload: SyncPayload) => void;
  /** Fluxo → Calculadora: atualiza Fluxo E notifica a Calculadora */
  syncToCalc: (payload: SyncPayload) => void;
  /** Registra o callback que a Calculadora usa para receber atualizações do Fluxo */
  registerCalcCallback: (cb: (payload: SyncPayload) => void) => void;
  // Legado (mantido para compatibilidade)
  syncValorImovel: (valor: number) => void;
  syncValorImovelParaCalc: (valor: number) => void;
  registerValorImovelCallback: (cb: (v: number) => void) => void;
}

const FluxoContext = createContext<FluxoContextType | null>(null);

export function FluxoProvider({ children }: { children: ReactNode }) {
  const [fluxo, setFluxoState] = useState<FluxoInputs>(defaultFluxo);
  const [nomeEmpreendimento, setNomeEmpreendimento] = useState("");

  // Callback registrado pelo Home.tsx
  const calcCallbackRef = useRef<((payload: SyncPayload) => void) | null>(null);

  const registerCalcCallback = useCallback((cb: (payload: SyncPayload) => void) => {
    calcCallbackRef.current = cb;
  }, []);

  // Legado
  const registerValorImovelCallback = useCallback((cb: (v: number) => void) => {
    calcCallbackRef.current = (p: SyncPayload) => { if (p.valorImovel !== undefined) cb(p.valorImovel); };
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
      const novoTotal = sem.length + 1;
      const valorProporcional = Math.round((prev.valorImovel * 0.03) / novoTotal);
      const novoValor = sem.length === 0 ? valorProporcional : sem[0].valor;
      const novasSemestrais = sem.length === 0
        ? [{ mes: proximoMes(lastMes, 6), valor: valorProporcional }]
        : [...sem, { mes: proximoMes(lastMes, 6), valor: novoValor }];
      return { ...prev, semestrais: novasSemestrais };
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

  /** Calculadora → Fluxo: atualiza sem disparar callback de volta */
  const syncFromCalc = useCallback((payload: SyncPayload) => {
    setFluxoState((prev) => {
      const next = { ...prev };
      let changed = false;
      if (payload.valorImovel !== undefined && prev.valorImovel !== payload.valorImovel) {
        next.valorImovel = payload.valorImovel;
        next.ato = buildAto(prev.percentualAto, prev.parcelasAto, payload.valorImovel);
        changed = true;
      }
      if (payload.taxaJurosMensal !== undefined && prev.taxaJurosMensal !== payload.taxaJurosMensal) {
        next.taxaJurosMensal = payload.taxaJurosMensal;
        changed = true;
      }
      if (payload.prazoMeses !== undefined && prev.prazoMeses !== payload.prazoMeses) {
        next.prazoMeses = payload.prazoMeses;
        changed = true;
      }
      if (payload.decoracao !== undefined && prev.decoracao !== payload.decoracao) {
        next.decoracao = payload.decoracao;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, []);

  /** Fluxo → Calculadora: atualiza Fluxo E notifica a Calculadora */
  const syncToCalc = useCallback((payload: SyncPayload) => {
    setFluxoState((prev) => {
      const next = { ...prev };
      if (payload.valorImovel !== undefined) {
        next.valorImovel = payload.valorImovel;
        next.ato = buildAto(prev.percentualAto, prev.parcelasAto, payload.valorImovel);
      }
      if (payload.taxaJurosMensal !== undefined) next.taxaJurosMensal = payload.taxaJurosMensal;
      if (payload.prazoMeses !== undefined) next.prazoMeses = payload.prazoMeses;
      if (payload.decoracao !== undefined) next.decoracao = payload.decoracao;
      return next;
    });
    if (calcCallbackRef.current) {
      calcCallbackRef.current(payload);
    }
  }, []);

  // Legado: mantém compatibilidade com código existente
  const syncValorImovel = useCallback((valor: number) => {
    syncFromCalc({ valorImovel: valor });
  }, [syncFromCalc]);

  const syncValorImovelParaCalc = useCallback((valor: number) => {
    syncToCalc({ valorImovel: valor });
  }, [syncToCalc]);

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
      syncFromCalc,
      syncToCalc,
      registerCalcCallback,
      // Legado
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
