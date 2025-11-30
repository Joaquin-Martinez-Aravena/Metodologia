// src/sections/Alertas.jsx
import React, { useEffect, useState } from "react";
import { obtenerAlertas, limpiarAlertas } from "../alertasService";

/* -----------------------------------------
   Badge para tipo de alerta del log
----------------------------------------- */
function AlertaBadge({ tipo }) {
  const map = {
    success: { variant: "status-badge--active", emoji: "✅", label: "Éxito" },
    error: { variant: "status-badge--inactive", emoji: "❌", label: "Error" },
    warning: { variant: "status-badge--warning", emoji: "⚠️", label: "Advertencia" },
    info: { variant: "status-badge--info", emoji: "ℹ️", label: "Info" },
  };

  const config = map[tipo] || map.info;

  return (
    <span className={`status-badge status-badge-small ${config.variant}`}>
      <span>{config.emoji}</span> {config.label}
    </span>
  );
}

/* -----------------------------------------
   Componente principal
----------------------------------------- */
export default function Alertas() {
  // Log de alertas locales
  const [alertasLog, setAlertasLog] = useState([]);
  const [expandedAlertId, setExpandedAlertId] = useState(null);

  const cargarAlertasLog = () => {
    const alertas = obtenerAlertas();
    setAlertasLog(alertas);
  };

  useEffect(() => {
    // Cargar alertas del localStorage al montar
    cargarAlertasLog();
  }, []);

  const handleLimpiarLog = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar todo el historial de alertas?")) {
      limpiarAlertas();
      setAlertasLog([]);
      alert("Historial de alertas limpiado.");
    }
  };

  const toggleExpanded = (id) => {
    setExpandedAlertId(expandedAlertId === id ? null : id);
  };

  return (
    <div className="alertas-wrapper">
      {/* ---------- Log de Alertas del Sistema (localStorage) ---------- */}
      <section className="alertas-log-section">
        <div className="alertas-log-header">
          <h2 className="alertas-log-title">Log de Alertas del Sistema</h2>
          <div className="alertas-log-actions">
            <button onClick={cargarAlertasLog} className="btn-outline-xs">
              🔄 Recargar
            </button>
            <button onClick={handleLimpiarLog} className="btn-outline-danger-xs">
              🗑️ Limpiar historial
            </button>
          </div>
        </div>

        <div className="alertas-log-box">
          {alertasLog.length === 0 ? (
            <div className="alertas-log-empty">
              <p>No hay alertas registradas todavía.</p>
              <p className="alertas-log-empty-hint">
                Las acciones que realices (crear empleados, compras, productos, etc.) se registrarán aquí automáticamente.
              </p>
            </div>
          ) : (
            alertasLog.map((alerta) => (
              <div key={alerta.id} className="alertas-log-item">
                <div className="alertas-log-item-header">
                  <AlertaBadge tipo={alerta.tipo} />
                  <span className="alertas-log-item-fecha">
                    {alerta.fechaLegible}
                  </span>
                </div>

                <p className="alertas-log-item-mensaje">{alerta.mensaje}</p>

                {alerta.detalles && (
                  <div className="alertas-log-item-details">
                    <button
                      onClick={() => toggleExpanded(alerta.id)}
                      className="alertas-log-toggle-btn"
                    >
                      {expandedAlertId === alerta.id
                        ? "▼ Ocultar detalles"
                        : "▶ Ver detalles"}
                    </button>

                    {expandedAlertId === alerta.id && (
                      <pre className="alertas-log-item-json">
                        {JSON.stringify(alerta.detalles, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
