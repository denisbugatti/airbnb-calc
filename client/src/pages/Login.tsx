/**
 * Login.tsx — tela de acesso restrito (fullscreen, brochure Vitacon).
 * O corretor digita o CPF; se estiver na lista, entra e a sessão fica salva
 * no aparelho até sair.
 */
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function mascaraCpf(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

export default function LoginPage() {
  const { login } = useAuth();
  const [cpf, setCpf] = useState("");
  const [erro, setErro] = useState(false);
  const [validando, setValidando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const digitos = cpf.replace(/\D/g, "");
  const completo = digitos.length === 11;

  const entrar = async () => {
    if (!completo || validando) return;
    setValidando(true);
    const u = await login(cpf);
    setValidando(false);
    if (!u) {
      setErro(true);
      inputRef.current?.select();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden" style={{ background: "#000000" }}>
      {/* Grafismo V — linhas diagonais da marca */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <svg className="absolute -right-24 -top-24 w-[55vw] max-w-[760px] opacity-90" viewBox="0 0 400 400">
          <polygon points="120,0 200,0 320,300 400,300 400,400 260,400" fill="#2800FF" />
          <polygon points="250,0 400,0 400,60 290,60" fill="none" stroke="#2800FF" strokeWidth="2" />
        </svg>
        <div className="absolute left-0 bottom-0 h-[2px] w-2/5" style={{ background: "#2800FF" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-sm px-6"
      >
        <img src="/vitacon-logo.png" alt="Vitacon" className="h-7 w-auto mb-8" />

        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[2px]" style={{ background: "#2800FF" }} />
          <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "#898A8E", fontFamily: "var(--font-mono)" }}>
            Acesso restrito
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-black uppercase leading-none mb-8"
          style={{ color: "#FFFFFF", fontFamily: "var(--font-display)", letterSpacing: "0.01em" }}
        >
          Rentabilidade<br />Imobiliária
        </h1>

        <label className="block text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: "#898A8E", fontFamily: "var(--font-mono)" }}>
          CPF
        </label>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => { setCpf(mascaraCpf(e.target.value)); setErro(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") entrar(); }}
          className="w-full text-lg font-bold rounded-xl px-4 py-3.5 outline-none transition-all"
          style={{
            background: "#111111",
            border: `1px solid ${erro ? "#FF6B57" : completo ? "#2800FF" : "#2A2A2A"}`,
            color: "#FFFFFF",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.05em",
          }}
        />
        <div className="text-xs mt-2" style={{ color: erro ? "#FF6B57" : "transparent", minHeight: "1.1em" }}>
          CPF não autorizado. Confira os números ou fale com o Denis.
        </div>

        <button
          onClick={entrar}
          disabled={!completo || validando}
          className="press w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-opacity"
          style={{
            background: completo ? "#2800FF" : "#1A1A1A",
            color: completo ? "#FFFFFF" : "#5C5C5C",
            fontFamily: "var(--font-display)",
            opacity: validando ? 0.7 : 1,
          }}
        >
          {validando ? "Verificando..." : "Entrar"}
          {!validando && <ArrowRight size={15} />}
        </button>

        <div className="flex items-center gap-2 mt-10">
          <Lock size={11} style={{ color: "#5C5C5C" }} />
          <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: "#5C5C5C", fontFamily: "var(--font-mono)" }}>
            Uso exclusivo do time Vitacon
          </span>
        </div>
      </motion.div>
    </div>
  );
}
