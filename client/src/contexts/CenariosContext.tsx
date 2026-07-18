/**
 * CenariosContext.tsx — Histórico de cenários salvos
 * Persiste em localStorage. Cada cenário captura inputs da Calculadora + Fluxo.
 */
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { CalculatorInputs } from "@/lib/calculator";
import type { FluxoInputs } from "@/contexts/FluxoContext";

export interface Cenario {
  id: string;
  nome: string;
  criadoEm: string; // ISO string
  inputs: CalculatorInputs;
  fluxo: FluxoInputs;
  nomeEmpreendimento?: string;
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
  salvarCenario: (nome: string, inputs: CalculatorInputs, fluxo: FluxoInputs, resultados: Cenario["resultados"], nomeEmpreendimento?: string) => void;
  removerCenario: (id: string) => void;
  duplicarCenario: (id: string) => void;
  limparHistorico: () => void;
}

const CenariosContext = createContext<CenariosCtx | null>(null);

const LEGACY_KEY = "airbnb_calc_cenarios_v1";

function chaveDoUsuario(userKey: string | null): string {
  return userKey ? `${LEGACY_KEY}:${userKey}` : LEGACY_KEY;
}

function loadFromStorage(key: string): Cenario[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as Cenario[];
  } catch {
    return [];
  }
}

export function CenariosProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const storageKey = chaveDoUsuario(usuario?.userKey ?? null);

  const [cenarios, setCenarios] = useState<Cenario[]>(() => loadFromStorage(storageKey));

  const saveToStorage = useCallback((lista: Cenario[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(lista));
    } catch {
      // quota exceeded — silently ignore
    }
  }, [storageKey]);

  // Troca de usuário: recarrega a lista dele; na primeira vez, migra os cenários
  // antigos (pré-login) para a conta que entrar primeiro neste navegador.
  useEffect(() => {
    if (usuario?.userKey && localStorage.getItem(storageKey) === null) {
      const legado = localStorage.getItem(LEGACY_KEY);
      if (legado) {
        localStorage.setItem(storageKey, legado);
        localStorage.removeItem(LEGACY_KEY);
      }
    }
    setCenarios(loadFromStorage(storageKey));
  }, [storageKey, usuario?.userKey]);

  const salvarCenario = useCallback((
    nome: string,
    inputs: CalculatorInputs,
    fluxo: FluxoInputs,
    resultados: Cenario["resultados"],
    nomeEmpreendimento?: string
  ) => {
    const novo: Cenario = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nome: nome.trim() || `Cenário ${new Date().toLocaleDateString("pt-BR")}`,
      criadoEm: new Date().toISOString(),
      inputs,
      fluxo,
      nomeEmpreendimento,
      resultados,
    };
    setCenarios(prev => {
      const updated = [novo, ...prev].slice(0, 20); // máximo 20 cenários
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const removerCenario = useCallback((id: string) => {
    setCenarios(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const duplicarCenario = useCallback((id: string) => {
    setCenarios(prev => {
      const original = prev.find(c => c.id === id);
      if (!original) return prev;
      const copia: Cenario = {
        ...original,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        nome: `${original.nome} (cópia)`,
        criadoEm: new Date().toISOString(),
      };
      const updated = [copia, ...prev].slice(0, 20);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const limparHistorico = useCallback(() => {
    setCenarios([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return (
    <CenariosContext.Provider value={{ cenarios, salvarCenario, removerCenario, duplicarCenario, limparHistorico }}>
      {children}
    </CenariosContext.Provider>
  );
}

export function useCenarios() {
  const ctx = useContext(CenariosContext);
  if (!ctx) throw new Error("useCenarios must be used within CenariosProvider");
  return ctx;
}
