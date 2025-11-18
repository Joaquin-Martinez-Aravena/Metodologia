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
const Pill = ({ children, color }) => (
  <span
    className={`inline-flex items-center px-2 py-1 text-xs font-medium ${color} rounded-full`}
  >
    {children}
  </span>
);

/* -----------------------------------------
   Mapeo de resumen de alertas desde la API
   API:
   {
     "stock_bajo": 2,
     "por_vencer": 0,
     "vencidos": 0,
     "total_alertas": 2
   }
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
  // estado para el RESUMEN que viene de la API
  const [alertasResumen, setAlertasResumen] = useState({
    stockLow: 0,
    porVencer: 0,
    vencidos: 0,
    total: 0,
  });
  const [loadingAlertas, setLoadingAlertas] = useState(false);
  const [errorAlertas, setErrorAlertas] = useState("");

  // cargar resumen desde la API al montar
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
    <div className="p-6 space-y-6">
      {/* ---------- Resumen numérico desde la API ---------- */}
      <section className="rounded-lg border border-slate-200 bg-[var(--card-bg)] shadow-sm dark:border-slate-700">
        <header className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-indigo-600">
            Resumen de Alertas
          </h2>
        </header>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold">
                  Stock bajo
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold">
                  Por vencer
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold">
                  Vencidos
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold">
                  Total alertas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loadingAlertas && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    Cargando alertas…
                  </td>
                </tr>
              )}

              {!loadingAlertas && !errorAlertas && (
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="whitespace-nowrap px-6 py-4 text-base text-slate-700 dark:text-slate-200">
                    {alertasResumen.stockLow}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-base text-slate-700 dark:text-slate-200">
                    {alertasResumen.porVencer}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-base text-slate-700 dark:text-slate-200">
                    {alertasResumen.vencidos}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-base text-slate-700 dark:text-slate-200">
                    {alertasResumen.total}
                  </td>
                </tr>
              )}

              {!loadingAlertas &&
                !errorAlertas &&
                alertasResumen.total === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No hay alertas activas.
                    </td>
                  </tr>
                )}

              {errorAlertas && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-rose-600 dark:text-rose-300"
                  >
                    {errorAlertas}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Productos en alerta (mock por ahora) ---------- */}
      <section className="rounded-lg border border-slate-200 bg-[var(--card-bg)] shadow-sm dark:border-slate-700">
        <header className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-indigo-600">
            Productos en Alerta
          </h2>
        </header>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold">
                  Nombre
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold">
                  Categoría
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold">
                  Estado
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold">
                  Fecha de Vencimiento
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold">
                  Lote
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold">
                  Descripción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {ALERTAS_PRODUCTOS_MOCK.map((alerta) => (
                <tr
                  key={alerta.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {alerta.nombre}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                    {alerta.categoria}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Pill
                      color={
                        alerta.estado === "Vencido"
                          ? "bg-red-700 text-white"
                          : alerta.estado === "Por vencer"
                          ? "bg-orange-600 text-white"
                          : alerta.estado === "En stock bajo"
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-700"
                      }
                    >
                      {alerta.estado}
                    </Pill>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {alerta.fechaVencimiento}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {alerta.lote}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {alerta.descripcion}
                  </td>
                </tr>
              ))}

              {ALERTAS_PRODUCTOS_MOCK.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No hay productos en alerta en este momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Log de alertas (mock) ---------- */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-indigo-600">Log de Alertas</h2>
        <div className="bg-gray-800 rounded-lg shadow-md p-4">
          {logs.map((log) => (
            <div key={log.id} className="text-white mb-2">
              <p>{log.mensaje}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
