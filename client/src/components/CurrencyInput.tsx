/**
 * CurrencyInput — Input monetário com formatação de milhar em tempo real
 * Exibe: R$ 477.000 | R$ 1.250.000 | R$ 14.950
 * Armazena: número puro (477000, 1250000, 14950)
 */

import { useRef, useCallback, type KeyboardEvent } from "react";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;          // padrão "R$"
  suffix?: string;          // ex: "m²", "%"
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  min?: number;
  max?: number;
  step?: number;
  allowDecimal?: boolean;   // padrão false para valores monetários inteiros
  decimalPlaces?: number;   // padrão 0
}

/** Formata número com pontos de milhar: 477000 → "477.000" */
function formatWithThousands(num: number, decimalPlaces = 0): string {
  if (isNaN(num) || num === 0) return "";
  if (decimalPlaces > 0) {
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimalPlaces,
    });
  }
  return Math.round(num).toLocaleString("pt-BR");
}

/** Remove formatação e retorna número puro: "477.000" → 477000 */
function parseFormatted(str: string): number {
  // Remove tudo exceto dígitos e vírgula (separador decimal pt-BR)
  const clean = str.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

/** Formata string enquanto o usuário digita */
function formatWhileTyping(raw: string, allowDecimal: boolean): string {
  // Mantém apenas dígitos e vírgula se decimal permitido
  let cleaned = allowDecimal
    ? raw.replace(/[^\d,]/g, "")
    : raw.replace(/\D/g, "");

  // Separa parte inteira e decimal
  const parts = cleaned.split(",");
  const intPart = parts[0].replace(/^0+(?=\d)/, ""); // remove zeros à esquerda

  // Aplica separador de milhar na parte inteira
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (allowDecimal && parts.length > 1) {
    return intFormatted + "," + parts[1];
  }
  return intFormatted;
}

export function CurrencyInput({
  value,
  onChange,
  prefix = "R$",
  suffix,
  placeholder = "0",
  className = "",
  style,
  min,
  max,
  step = 1,
  allowDecimal = false,
  decimalPlaces = 0,
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditingRef = useRef(false);

  // Valor exibido: formata com milhar quando não está editando
  const displayValue = isEditingRef.current
    ? undefined // controlado pelo input durante edição
    : formatWithThousands(value, decimalPlaces);

  const handleFocus = useCallback(() => {
    isEditingRef.current = true;
    if (inputRef.current) {
      // Ao focar, mostra o valor formatado sem o prefixo
      inputRef.current.value = value > 0 ? formatWithThousands(value, decimalPlaces) : "";
      // Seleciona todo o texto
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [value, decimalPlaces]);

  const handleBlur = useCallback(() => {
    isEditingRef.current = false;
    if (inputRef.current) {
      const parsed = parseFormatted(inputRef.current.value);
      let clamped = parsed;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
      onChange(clamped);
      // Reformata ao sair do campo
      inputRef.current.value = formatWithThousands(clamped, decimalPlaces);
    }
  }, [onChange, min, max, decimalPlaces]);

  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const raw = el.value;
    const cursorPos = el.selectionStart ?? raw.length;

    // Conta pontos antes do cursor para compensar depois da reformatação
    const dotsBeforeCursor = (raw.slice(0, cursorPos).match(/\./g) || []).length;

    const formatted = formatWhileTyping(raw, allowDecimal);
    el.value = formatted;

    // Reposiciona cursor compensando os pontos adicionados/removidos
    const newDotsBeforeCursor = (formatted.slice(0, cursorPos).match(/\./g) || []).length;
    const dotDiff = newDotsBeforeCursor - dotsBeforeCursor;
    const newCursor = Math.max(0, cursorPos + dotDiff);
    el.setSelectionRange(newCursor, newCursor);

    // Atualiza o valor numérico em tempo real
    const parsed = parseFormatted(formatted);
    onChange(parsed);
  }, [onChange, allowDecimal]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    // Setas para incrementar/decrementar
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newVal = value + step;
      const clamped = max !== undefined ? Math.min(max, newVal) : newVal;
      onChange(clamped);
      if (inputRef.current) {
        inputRef.current.value = formatWithThousands(clamped, decimalPlaces);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newVal = value - step;
      const clamped = min !== undefined ? Math.max(min, newVal) : newVal;
      onChange(clamped);
      if (inputRef.current) {
        inputRef.current.value = formatWithThousands(clamped, decimalPlaces);
      }
    } else if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  }, [value, step, min, max, onChange, decimalPlaces]);

  return (
    <div className="flex items-center gap-1.5 w-full">
      {prefix && (
        <span className="text-sm font-medium shrink-0 select-none opacity-60">
          {prefix}
        </span>
      )}
      <input
        ref={inputRef}
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        defaultValue={displayValue}
        key={isEditingRef.current ? "editing" : `display-${value}`}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`flex-1 bg-transparent outline-none min-w-0 ${className}`}
        style={style}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {suffix && (
        <span className="text-sm font-medium shrink-0 select-none opacity-60">
          {suffix}
        </span>
      )}
    </div>
  );
}
