/**
 * CenariosContext.tsx — Histórico de cenários salvos
 * Persiste em localStorage. Cada cenário captura inputs da Calculadora + Fluxo.
 */
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { CalculatorInputs } from "@/lib/calculator";
import type { FluxoInputs } from "@/contexts/FluxoContext";

export interface Cenario {
  id: string;
  nome: string;
  criadoEm: string; // ISO string
  inputs: CalculatorInputs;
  fluxo: FluxoInputs;
  resultados: {
    rendaMensalLiquida: number;
    rentabilidadeAnual: number;
    totalInvestido: number;
    financiamento: number;
    valorImovel: number;
  };
}

interface CenariosCtx {
  cenarios: Cenario[];
  salvarCenario: (nome: string, inputs: CalculatorInputs, fluxo: FluxoInputs, resultados: Cenario["resultados"]) => void;
  removerCenario: (id: string) => void;
  limparHistorico: () => void;
}

const CenariosContext = createContext<CenariosCtx | null>(null);

const STORAGE_KEY = "airbnb_calc_cenarios_v1";

function loadFromStorage(): Cenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Cenario[];
  } catch {
    return [];
  }
}

function saveToStorage(cenarios: Cenario[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cenarios));
  } catch {
    // quota exceeded — silently ignore
  }
}

export function CenariosProvider({ children }: { children: ReactNode }) {
  const [cenarios, setCenarios] = useState<Cenario[]>(() => loadFromStorage());

  const salvarCenario = useCallback((
    nome: string,
    inputs: CalculatorInputs,
    fluxo: FluxoInputs,
    resultados: Cenario["resultados"]
  ) => {
    const novo: Cenario = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nome: nome.trim() || `Cenário ${new Date().toLocaleDateString("pt-BR")}`,
      criadoEm: new Date().toISOString(),
      inputs,
      fluxo,
      resultados,
    };
    setCenarios(prev => {
      const updated = [novo, ...prev].slice(0, 20); // máximo 20 cenários
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const removerCenario = useCallback((id: string) => {
    setCenarios(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const limparHistorico = useCallback(() => {
    setCenarios([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <CenariosContext.Provider value={{ cenarios, salvarCenario, removerCenario, limparHistorico }}>
      {children}
    </CenariosContext.Provider>
  );
}

export function useCenarios() {
  const ctx = useContext(CenariosContext);
  if (!ctx) throw new Error("useCenarios must be used within CenariosProvider");
  return ctx;
}
