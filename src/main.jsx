import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Default: oscuro para Tailwind (puedes quitar esta línea si prefieres iniciar en claro)
document.documentElement.classList.add("dark");

// Mini guard: que exista #root
const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML = "<pre style='padding:12px;background:#fee;color:#900'>Falta &lt;div id=\"root\"&gt; en index.html</pre>";
  throw new Error("No se encontró #root");
}

try {
  createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e) {
  console.error("Fallo al montar React:", e);
  rootEl.innerHTML = `<pre style="padding:12px;background:#fee;color:#900">Error al montar la app: ${e?.message || e}</pre>`;
}
