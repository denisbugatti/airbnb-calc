/**
 * AuthContext.tsx — acesso restrito ao time (15 usuários).
 * Login por CPF: o CPF digitado é normalizado (só dígitos), passa por SHA-256
 * e é comparado com a lista de hashes — nenhum CPF fica legível no código.
 * Sessão persistida em localStorage ("vitacon-auth"); os cenários salvos são
 * escopados por usuário usando um prefixo derivado do hash.
 */
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Usuario {
  nome: string;
  /** Prefixo curto do hash — identifica o usuário para escopo de dados locais */
  userKey: string;
}

interface AuthCtx {
  usuario: Usuario | null;
  login: (cpf: string) => Promise<Usuario | null>;
  logout: () => void;
}

/** SHA-256(cpf só dígitos) → nome */
const USUARIOS: Record<string, string> = {
  "60e1654e5d5b8f4a6e12b06efbd468024d678bff95ac75133b954294f90fd86b": "Pedro Paraiso",
  "d665ccf401ddda9f8cfff7b33d54d8f46536b0d5972f3220fc7d23eea9c31c65": "Vinicius Shaolin",
  "924a48f717dd419f85763db73c7e641df57fb6aa92276ddeca20c484d8d5c3cc": "Victor Masson",
  "8755e348c89f3cd1dfa0d8f85d1e5c05f0b0131e7c79de0b149a99918e2fa850": "Kaio Henrique",
  "3f3e36e9b2f0c49091084747aaace884692cc3f8e288b8bcd3e828d5293c8746": "Eduardo Alves",
  "54f2f493e555df9fc329765b889b2a92b0e8e4a72e584ad9531a1022050e9ffa": "Matheus Ornelas",
  "76b61e69d2fb9660ed20a603b491cb04c8744cab5bd439c97c484aa971cf3a42": "Geovana Gomes",
  "6c95b3eec1c07428c23a841d1156221e6a889bb3b3814b6188b13127e4c73d6c": "Kaio Materazzi",
  "4bb3b381d7a88db02c3e6cac0ce6378f5538ea497c4fa35cec2a81d3d9359d1a": "Vitoria Bugatti",
  "7559ffc777d5e39732762ce0bd5b2371ffa9dbd4099740815b7b6144f75e47f1": "Kleber Pantaleão",
  "1499644e53e2f737c3cc6624fb3e5dd2081cca6df66fc49517a2c77b38901d88": "Matheus Corleone",
  "a9f9cbaea3a70952bdf3d5efe34a1ddc64f3686fee3f161826d69d92cad4f663": "Gregorio Ramos",
  "84a592031a77a88935536ed93ec0531e22e9159fd54a072b38aa0091822d6248": "Miguel Marcondes",
  "e5471ac53b49b11dcf998b9f9963a0a36f7debe8d7d1c04c4ea3e2d55ee10051": "Denis Bugatti",
  "f054bdd2d37ba6f222fccdeb001daf3b34d6ca075bb7a131cde54e4e5a2487cf": "Leonardo Mascherano",
};

const SESSION_KEY = "vitacon-auth";

async function sha256Hex(texto: string): Promise<string> {
  const data = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function carregarSessao(): Usuario | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Usuario;
    return s?.nome && s?.userKey ? s : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => carregarSessao());

  const login = useCallback(async (cpf: string): Promise<Usuario | null> => {
    const digitos = cpf.replace(/\D/g, "");
    if (digitos.length !== 11) return null;
    const hash = await sha256Hex(digitos);
    const nome = USUARIOS[hash];
    if (!nome) return null;
    const u: Usuario = { nome, userKey: hash.slice(0, 12) };
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setUsuario(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUsuario(null);
  }, []);

  return <AuthContext.Provider value={{ usuario, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
