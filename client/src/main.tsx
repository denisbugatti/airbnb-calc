import { createRoot } from "react-dom/client";
import App from "./App";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
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
