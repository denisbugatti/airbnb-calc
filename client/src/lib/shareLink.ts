/**
 * shareLink.ts — Codifica/decodifica os inputs da calculadora na URL
 * Usa JSON + base64 para gerar links compartilháveis
 */

import type { CalculatorInputs } from "./calculator";
import type { FluxoInputs } from "@/contexts/FluxoContext";

export interface SharePayload {
  v: number;          // versão do schema
  calc: CalculatorInputs;
  fluxo: Partial<FluxoInputs>;
  nome?: string;
}

const SCHEMA_VERSION = 1;

export function encodeShareLink(
  calc: CalculatorInputs,
  fluxo: FluxoInputs,
  nome?: string,
): string {
  const payload: SharePayload = {
    v: SCHEMA_VERSION,
    calc,
    fluxo: {
      percentualAto: fluxo.percentualAto,
      parcelasAto: fluxo.parcelasAto,
      ato: fluxo.ato,
      valorMensal: fluxo.valorMensal,
      numMensais: fluxo.numMensais,
      semestrais: fluxo.semestrais,
      anuais: fluxo.anuais,
      desconto: fluxo.desconto,
    },
    nome,
  };
  try {
    const json = JSON.stringify(payload);
    const encoded = btoa(encodeURIComponent(json));
    const url = new URL(window.location.href);
    url.searchParams.set("s", encoded);
    return url.toString();
  } catch {
    return window.location.href;
  }
}

export function decodeShareLink(): SharePayload | null {
  try {
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get("s");
    if (!encoded) return null;
    const json = decodeURIComponent(atob(encoded));
    const payload = JSON.parse(json) as SharePayload;
    if (payload.v !== SCHEMA_VERSION) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback para browsers sem clipboard API
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  }
}
