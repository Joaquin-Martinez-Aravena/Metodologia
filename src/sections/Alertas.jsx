// src/sections/Alertas.jsx
import React, { useEffect, useState } from "react";
import { getAlertas /*, crearAlertas */ } from "../api";

/* -----------------------------------------
   Datos mock para la tabla de productos en alerta
   (la API por ahora solo entrega el resumen)
----------------------------------------- */
const ALERTAS_PRODUCTOS_MOCK = [
  {
    id: 1,
    nombre: "Paracetamol 500mg",
    categoria: "Analgésico",
    estado: "Vencido",
    fechaVencimiento: "2025-01-15",
    lote: "A001",
    descripcion: "Lote vencido, retirar del stock.",
  },
  {
    id: 2,
    nombre: "Amoxicilina 500mg",
    categoria: "Antibiótico",
    estado: "Por vencer",
    fechaVencimiento: "2025-02-01",
    lote: "B010",
    descripcion: "Revisar rotación, fecha próxima.",
  },
];

/* Log de alertas (mock) */
const logs = [
  { id: 1, mensaje: "Se venció el lote A001 de Paracetamol 500mg" },
  { id: 2, mensaje: "Se recibió un nuevo lote de Amoxicilina 500mg" },
];

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
   Mapeo de resumen de alertas desde la API
----------------------------------------- */
function mapResumenAlertas(data) {
  const src = data && typeof data === "object" ? data : {};

  const normalizadasAlertas = {
    stockLow: src.stock_bajo ?? 0,
    porVencer: src.por_vencer ?? 0,
    vencidos: src.vencidos ?? 0,
    total: src.total_alertas ?? 0,
  };

  console.log("📦 Alertas normalizadas:", normalizadasAlertas);
  return normalizadasAlertas;
}

/* -----------------------------------------
   Componente principal
----------------------------------------- */
export default function Alertas() {
  const [alertasResumen, setAlertasResumen] = useState({
    stockLow: 0,
    porVencer: 0,
    vencidos: 0,
    total: 0,
  });
  const [loadingAlertas, setLoadingAlertas] = useState(false);
  const [errorAlertas, setErrorAlertas] = useState("");

  useEffect(() => {
    async function cargarAlertasDesdeAPI() {
      console.log("🔍 Montando Alertas: llamando getAlertas()");

      try {
        setLoadingAlertas(true);
        setErrorAlertas("");

        const data = await getAlertas();

        if (data && data.__error) {
          console.warn("⚠️ Error lógico getAlertas:", data);
          setErrorAlertas(
            `No se pudieron cargar las alertas${
              data.status ? ` (status: ${data.status})` : ""
            }`
          );
          setAlertasResumen({
            stockLow: 0,
            porVencer: 0,
            vencidos: 0,
            total: 0,
          });
          return;
        }

        const mapped = mapResumenAlertas(data);
        setAlertasResumen(mapped);
      } catch (err) {
        console.error("💥 Excepción en cargarAlertas:", err);
        setErrorAlertas("No se pudieron cargar las alertas desde la API.");
        setAlertasResumen({
          stockLow: 0,
          porVencer: 0,
          vencidos: 0,
          total: 0,
        });
      } finally {
        setLoadingAlertas(false);
      }
    }

    cargarAlertasDesdeAPI();
  }, []);

  return (
    <div className="alertas-wrapper">
      {/* ---------- Resumen numérico desde la API ---------- */}
      <section className="alertas-card">
        <header className="alertas-card-header">
          <h2 className="alertas-card-title">Resumen de Alertas</h2>
        </header>

        <div className="alertas-table-container">
          <table className="table-main">
            <thead className="table-main-head-alertas">
              <tr>
                <th className="table-head-cell-xs">Stock bajo</th>
                <th className="table-head-cell-xs">Por vencer</th>
                <th className="table-head-cell-xs">Vencidos</th>
                <th className="table-head-cell-xs">Total alertas</th>
              </tr>
            </thead>
            <tbody className="table-main-body">
              {loadingAlertas && (
                <tr>
                  <td colSpan={4} className="table-main-message">
                    Cargando alertas…
                  </td>
                </tr>
              )}

              {!loadingAlertas && !errorAlertas && (
                <tr className="table-main-row">
                  <td className="table-cell">
                    {alertasResumen.stockLow}
                  </td>
                  <td className="table-cell">
                    {alertasResumen.porVencer}
                  </td>
                  <td className="table-cell">
                    {alertasResumen.vencidos}
                  </td>
                  <td className="table-cell">
                    {alertasResumen.total}
                  </td>
                </tr>
              )}

              {!loadingAlertas &&
                !errorAlertas &&
                alertasResumen.total === 0 && (
                  <tr>
                    <td colSpan={4} className="table-main-message">
                      No hay alertas activas.
                    </td>
                  </tr>
                )}

              {errorAlertas && (
                <tr>
                  <td colSpan={4} className="table-main-message-error">
                    {errorAlertas}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Productos en alerta (mock por ahora) ---------- */}
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

      {/* ---------- Log de alertas (mock) ---------- */}
      <section className="alertas-log-section">
        <h2 className="alertas-log-title">Log de Alertas</h2>
        <div className="alertas-log-box">
          {logs.map((log) => (
            <div key={log.id} className="alertas-log-item">
              <p>{log.mensaje}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
