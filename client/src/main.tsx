import { createRoot } from "react-dom/client";
import App from "./App";
// Só o subset latin (cobre o português) — evita carregar cyrillic/grego/vietnamita.
// Reduz de ~58 para ~12 arquivos de fonte: app mais leve e export de PNG muito mais rápido.
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/jetbrains-mono/latin-700.css";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Registrar Service Worker para PWA (somente em produção / HTTPS)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // silencioso — PWA é opcional
    });
  });
}
