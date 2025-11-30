// src/sections/Alertas.jsx
import React, { useEffect, useState } from "react";
import { obtenerAlertas, limpiarAlertas } from "../alertasService";

/* -----------------------------------------
   Datos de productos en alerta (vacío por ahora)
----------------------------------------- */
const ALERTAS_PRODUCTOS_MOCK = [];

/* -----------------------------------------
   Utils visuales
----------------------------------------- */
const Pill = ({ children, variant }) => (
  <span className={`pill-alert ${variant}`}>{children}</span>
);

function pillVariant(estado) {
  switch (estado) {
    case "Vencido":
      return "pill-alert--vencido";
    case "Por vencer":
      return "pill-alert--por-vencer";
    case "En stock bajo":
      return "pill-alert--stock-bajo";
    default:
      return "pill-alert--default";
  }
}

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
      {/* ---------- Productos en alerta (sin datos por ahora) ---------- */}
      <section className="alertas-card">
        <header className="alertas-card-header">
          <h2 className="alertas-card-title">Productos en Alerta</h2>
        </header>

        <div className="alertas-table-container">
          <table className="table-main">
            <thead className="table-main-head-alertas">
              <tr>
                <th className="table-head-cell-xs">Nombre</th>
                <th className="table-head-cell-xs">Categoría</th>
                <th className="table-head-cell-xs">Estado</th>
                <th className="table-head-cell-xs">Fecha de Vencimiento</th>
                <th className="table-head-cell-xs">Lote</th>
                <th className="table-head-cell-xs">Descripción</th>
              </tr>
            </thead>
            <tbody className="table-main-body">
              {ALERTAS_PRODUCTOS_MOCK.map((alerta) => (
                <tr key={alerta.id} className="table-main-row">
                  <td className="table-cell-small-muted">{alerta.nombre}</td>
                  <td className="table-cell-strong">{alerta.categoria}</td>
                  <td className="table-cell">
                    <Pill variant={pillVariant(alerta.estado)}>
                      {alerta.estado}
                    </Pill>
                  </td>
                  <td className="table-cell-small-muted">
                    {alerta.fechaVencimiento}
                  </td>
                  <td className="table-cell-small-muted">{alerta.lote}</td>
                  <td className="table-cell-small-muted">
                    {alerta.descripcion}
                  </td>
                </tr>
              ))}

              {ALERTAS_PRODUCTOS_MOCK.length === 0 && (
                <tr>
                  <td colSpan={6} className="table-main-message">
                    No hay productos en alerta en este momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

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
                      {expandedAlertId === alerta.id ? "▼ Ocultar detalles" : "▶ Ver detalles"}
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
