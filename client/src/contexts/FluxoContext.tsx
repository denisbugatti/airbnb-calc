/**
 * FluxoContext — Estado único compartilhado entre Calculadora e Fluxo de Pagamento
 *
 * Todos os campos de CalculatorInputs vivem aqui. Qualquer edição em qualquer
 * aba é imediatamente refletida na outra, sem callbacks ou sincronização manual.
 */

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
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
  /** Override manual do financiamento; undefined = automático (saldo restante) */
  financiamentoManual?: number;
  /** Quando true, o financiamento é excluído do fluxo (pagamento à vista): linha/cartão somem e o saldo a financiar vira 0 */
  financiamentoExcluido?: boolean;
  /** Desconto em R$ sobre o valor de tabela; undefined = sem desconto. valorImovel guarda o líquido (tabela − desconto) */
  desconto?: number;
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

export const MESES = [
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

export function calcularFluxo(fluxo: FluxoInputs, valorImovel: number): FluxoResults {
  const totalAto = fluxo.ato.reduce((s, p) => s + p.valor, 0);
  const totalMensais = fluxo.valorMensal * fluxo.numMensais;
  const totalSemestrais = (fluxo.semestrais ?? []).reduce((s, p) => s + p.valor, 0);
  const totalAnuais = fluxo.anuais.reduce((s, p) => s + p.valor, 0);
  const totalExtras = (fluxo.extras ?? []).reduce((s, e) => s + e.valor * e.parcelas, 0);
  const totalInvestido = totalAto + totalMensais + totalSemestrais + totalAnuais + totalExtras;
  const financiamento = fluxo.financiamentoExcluido
    ? 0
    : fluxo.financiamentoManual !== undefined
      ? fluxo.financiamentoManual
      : Math.max(0, valorImovel - totalInvestido);
  return { totalAto, totalMensais, totalSemestrais, totalAnuais, totalExtras, totalInvestido, financiamento };
}

const defaultValorImovel = defaultInputs.valorImovel;

// Tabela padrão: ATO 10% · MENSAL 5% · ANUAL 5% · ÚNICA 10% · FINANCIAMENTO 70% (automático)
const defaultFluxo: FluxoInputs = {
  percentualAto: 10,
  parcelasAto: 1,
  ato: buildAto(10, 1, defaultValorImovel),
  valorMensal: 0,
  numMensais: 37,
  semestrais: [],
  anuais: buildAnuais(2, defaultValorImovel),
  extras: [{ id: "unica-padrao", tipo: "ÚNICA", parcelas: 1, valor: 0, mes: proximoMes(mesAtual(), 36) }],
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

  // ── Desconto sobre o valor de tabela ──────────────────────────────────────
  /** Valor de tabela (original, sem desconto) = valorImovel + desconto */
  valorTabela: number;
  /** Aplica/atualiza o desconto em R$; o fluxo reescala sobre o valor líquido */
  aplicarDesconto: (valor: number) => void;
  /** Remove o desconto e restaura o valor de tabela como valor do imóvel */
  removerDesconto: () => void;
  /** Edita o valor de tabela mantendo o desconto aplicado */
  setValorTabela: (tabela: number) => void;

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
  const viRef = useRef(defaultValorImovel);

  // ── Calculadora ──────────────────────────────────────────────────────────

  const setCalc = useCallback((fn: (prev: CalculatorInputs) => CalculatorInputs) => {
    setCalcState(fn);
  }, []);

  const setCalcField = useCallback((key: keyof CalculatorInputs, value: number) => {
    setCalcState((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Fluxo ────────────────────────────────────────────────────────────────

  // Total investido das séries (sem financiamento)
  const totalSeriesDe = (f: FluxoInputs) =>
    f.ato.reduce((s, p) => s + p.valor, 0) +
    f.valorMensal * f.numMensais +
    (f.semestrais ?? []).reduce((s, p) => s + p.valor, 0) +
    f.anuais.reduce((s, p) => s + p.valor, 0) +
    (f.extras ?? []).reduce((s, e) => s + e.valor * e.parcelas, 0);

  // Toda mutação passa por aqui: se as séries mudaram e o financiamento estava
  // fixado manualmente, ele volta ao automático (saldo restante) para os % fecharem.
  const setFluxoGuard = useCallback((fn: (prev: FluxoInputs) => FluxoInputs) => {
    setFluxoState((prev) => {
      const next = fn(prev);
      if (next === prev) return prev;
      if (
        next.financiamentoManual !== undefined &&
        next.financiamentoManual === prev.financiamentoManual &&
        totalSeriesDe(next) !== totalSeriesDe(prev)
      ) {
        return { ...next, financiamentoManual: undefined };
      }
      return next;
    });
  }, []);

  const setFluxo = useCallback((fn: (prev: FluxoInputs) => FluxoInputs) => {
    setFluxoGuard(fn);
  }, [setFluxoGuard]);

  const updateAto = useCallback((percentual: number, parcelas: number) => {
    setCalcState((prev) => prev); // garante acesso ao valorImovel atual
    setFluxoGuard((prev) => ({
      ...prev,
      percentualAto: percentual,
      parcelasAto: parcelas,
      ato: buildAto(percentual, parcelas, calc.valorImovel),
    }));
  }, [calc.valorImovel]);

  const updateParcelaAtoMes = useCallback((idx: number, mes: string) => {
    setFluxoGuard((prev) => {
      const ato = [...prev.ato];
      ato[idx] = { ...ato[idx], mes };
      return { ...prev, ato };
    });
  }, []);

  const updateParcelaAtoValor = useCallback((idx: number, valor: number) => {
    setFluxoGuard((prev) => {
      const ato = [...prev.ato];
      ato[idx] = { ...ato[idx], valor };
      return { ...prev, ato };
    });
  }, []);

  const updateAnualMes = useCallback((idx: number, mes: string) => {
    setFluxoGuard((prev) => {
      const anuais = [...prev.anuais];
      anuais[idx] = { ...anuais[idx], mes };
      return { ...prev, anuais };
    });
  }, []);

  const updateAnualValor = useCallback((idx: number, valor: number) => {
    setFluxoGuard((prev) => {
      const anuais = [...prev.anuais];
      anuais[idx] = { ...anuais[idx], valor };
      return { ...prev, anuais };
    });
  }, []);

  const addAnual = useCallback(() => {
    setFluxoGuard((prev) => {
      const lastMes = prev.anuais.length > 0 ? prev.anuais[prev.anuais.length - 1].mes : mesAtual();
      return {
        ...prev,
        anuais: [...prev.anuais, { mes: proximoMes(lastMes, 12), valor: prev.anuais[0]?.valor ?? 0 }],
      };
    });
  }, []);

  const removeAnual = useCallback(() => {
    setFluxoGuard((prev) => {
      if (prev.anuais.length === 0) return prev;
      return { ...prev, anuais: prev.anuais.slice(0, -1) };
    });
  }, []);

  const removeAnualAt = useCallback((idx: number) => {
    setFluxoGuard((prev) => ({
      ...prev,
      anuais: prev.anuais.filter((_, i) => i !== idx),
    }));
  }, []);

  const reorderAnuais = useCallback((fromIdx: number, toIdx: number) => {
    setFluxoGuard((prev) => {
      const arr = [...prev.anuais];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return { ...prev, anuais: arr };
    });
  }, []);

  const updateSemestralMes = useCallback((idx: number, mes: string) => {
    setFluxoGuard((prev) => {
      const semestrais = [...(prev.semestrais ?? [])];
      semestrais[idx] = { ...semestrais[idx], mes };
      return { ...prev, semestrais };
    });
  }, []);

  const updateSemestralValor = useCallback((idx: number, valor: number) => {
    setFluxoGuard((prev) => {
      const semestrais = [...(prev.semestrais ?? [])];
      semestrais[idx] = { ...semestrais[idx], valor };
      return { ...prev, semestrais };
    });
  }, []);

  const addSemestral = useCallback(() => {
    setFluxoGuard((prev) => {
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
    setFluxoGuard((prev) => {
      const sem = prev.semestrais ?? [];
      if (sem.length === 0) return prev;
      return { ...prev, semestrais: sem.slice(0, -1) };
    });
  }, []);

  const removeSemestralAt = useCallback((idx: number) => {
    setFluxoGuard((prev) => ({
      ...prev,
      semestrais: (prev.semestrais ?? []).filter((_, i) => i !== idx),
    }));
  }, []);

  const reorderSemestrais = useCallback((fromIdx: number, toIdx: number) => {
    setFluxoGuard((prev) => {
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
    // Quando o valorImovel muda: aplica a tabela padrão (se tudo zerado) ou escala proporcionalmente
    if (payload.valorImovel !== undefined) {
      const oldVi = viRef.current;
      const newVi = payload.valorImovel;
      viRef.current = newVi;
      setFluxoState((prev) => {
        const totalOutros =
          prev.valorMensal * prev.numMensais +
          prev.anuais.reduce((s, a) => s + a.valor, 0) +
          (prev.semestrais ?? []).reduce((s, x) => s + x.valor, 0) +
          (prev.extras ?? []).reduce((s, e) => s + e.valor * e.parcelas, 0);
        const ato = buildAto(prev.percentualAto, prev.parcelasAto, newVi);
        if (totalOutros === 0 && newVi > 0) {
          // Tabela padrão: 5% mensais + 5% anuais + 10% única
          const nAnuais = Math.max(1, prev.anuais.length || 2);
          return {
            ...prev,
            ato,
            numMensais: prev.numMensais || 37,
            valorMensal: Math.round((0.05 * newVi) / Math.max(1, prev.numMensais || 37)),
            anuais: (prev.anuais.length ? prev.anuais : buildAnuais(2, newVi)).map((a) => ({
              ...a, valor: Math.round((0.05 * newVi) / nAnuais),
            })),
            extras: (prev.extras && prev.extras.length
              ? prev.extras.map((e) => e.tipo === "ÚNICA" ? { ...e, valor: Math.round(0.10 * newVi) } : e)
              : [{ id: "unica-padrao", tipo: "ÚNICA", parcelas: 1, valor: Math.round(0.10 * newVi), mes: proximoMes(mesAtual(), 36) }]),
          };
        }
        const ratio = oldVi > 0 && newVi > 0 ? newVi / oldVi : 1;
        return {
          ...prev,
          ato,
          valorMensal: Math.round(prev.valorMensal * ratio),
          anuais: prev.anuais.map((a) => ({ ...a, valor: Math.round(a.valor * ratio) })),
          semestrais: (prev.semestrais ?? []).map((s) => ({ ...s, valor: Math.round(s.valor * ratio) })),
          extras: (prev.extras ?? []).map((e) => ({ ...e, valor: Math.round(e.valor * ratio) })),
          financiamentoManual: prev.financiamentoManual !== undefined ? Math.round(prev.financiamentoManual * ratio) : undefined,
        };
      });
    }
  }, []);

  // ── Desconto sobre o valor de tabela ──────────────────────────────────────
  // valorImovel guarda sempre o líquido; o desconto vive no fluxo e a tabela é derivada.
  // Alterar tabela/desconto passa por syncFromCalc, que reescala as séries proporcionalmente.

  const valorTabela = calc.valorImovel + (fluxo.desconto ?? 0);

  const aplicarDesconto = useCallback((valor: number) => {
    const v = Math.max(0, Math.min(Math.round(valor), valorTabela));
    setFluxoState((prev) => ({ ...prev, desconto: v }));
    syncFromCalc({ valorImovel: valorTabela - v });
  }, [valorTabela, syncFromCalc]);

  const removerDesconto = useCallback(() => {
    setFluxoState((prev) => ({ ...prev, desconto: undefined }));
    syncFromCalc({ valorImovel: valorTabela });
  }, [valorTabela, syncFromCalc]);

  const setValorTabela = useCallback((tabela: number) => {
    const t = Math.max(0, Math.round(tabela));
    const d = Math.min(fluxo.desconto ?? 0, t);
    setFluxoState((prev) => ({ ...prev, desconto: prev.desconto !== undefined ? d : undefined }));
    syncFromCalc({ valorImovel: t - d });
  }, [fluxo.desconto, syncFromCalc]);

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
      valorTabela, aplicarDesconto, removerDesconto, setValorTabela,
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

export { mesAtual };
