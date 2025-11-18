// src/sections/Empleados.jsx
import React, { useEffect, useState } from "react";
import { getEmpleados } from "../api";

// Pill por si después quieres usarlo para mostrar la actividad con color
const Pill = ({ children, color }) => (
  <span
    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${color}`}
  >
    {children}
  </span>
);

// 🔹 Función pura: SOLO transforma la data, sin hooks ni setState
function mapListaEmpleados(data) {
  console.log("📦 DATA cruda Empleados:", data);

  const list = Array.isArray(data) ? data : [];

  const normalizados = list.map((e) => ({
    name: e.nombre,
    lastname: e.apellido,
    rut: e.rut,
    age: e.edad,
    status:
      e.actividad === "disponible"
        ? "Disponible"
        : e.actividad === "enturno"
        ? "En turno"
        : "En descanso",
    id: e.id_empleado,
  }));

  console.log("📦 Empleados normalizados:", normalizados);
  return normalizados;
}

export default function Empleados() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Si quieres después, puedes agregar búsqueda/filtros aquí
  // const [query, setQuery] = useState("");

  useEffect(() => {
    async function cargarEmpleadosDesdeAPI() {
      console.log("🔍 Montando Empleados: llamando getEmpleados()");
      try {
        setLoading(true);
        setError("");

        const data = await getEmpleados();

        // Por si tu helper de API te devuelve errores envueltos
        if (data && data.__error) {
          console.warn("⚠️ Error lógico getEmpleados:", data);
          setError(
            `No se pudieron cargar los empleados${
              data.status ? ` (status: ${data.status})` : ""
            }`
          );
          setRows([]);
          return;
        }

        const normalizados = mapListaEmpleados(data);
        setRows(normalizados);
      } catch (err) {
        console.error("💥 Excepción en cargarEmpleados:", err);
        setError("No se pudieron cargar los empleados desde la API.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    cargarEmpleadosDesdeAPI();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <section className="rounded-lg border border-slate-200 bg-[var(--card-bg)] shadow-sm dark:border-slate-700">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Gestión de Empleados
          </h2>

          {/* Aquí más adelante puedes poner botón "Nuevo Empleado" */}
        </header>

        {/* Aquí podrías meter un buscador si quieres, como en Productos */}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-blue-50 text-slate-600 dark:bg-blue-800 dark:text-slate-300">
              <tr>
                <th className="whitespace-nowrap px-6 py-4 text-left text-base font-semibold">
                  RUT
                </th>
                <th className="whitespace-nowrap px-6 py-4 text-left text-base font-semibold">
                  Nombre
                </th>
                <th className="whitespace-nowrap px-6 py-4 text-left text-base font-semibold">
                  Edad
                </th>
                <th className="whitespace-nowrap px-6 py-4 text-left text-base font-semibold">
                  Estado
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {/* Estado: cargando */}
              {loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    Cargando empleados…
                  </td>
                </tr>
              )}

              {/* Estado: error */}
              {!loading && error && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-red-600 dark:text-red-400"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {/* Datos */}
              {!loading &&
                !error &&
                rows.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  >
                    {/* RUT */}
                    <td className="whitespace-nowrap px-6 py-4 text-base text-slate-500 dark:text-slate-400">
                      {e.rut}
                    </td>

                    {/* Nombre + Apellido */}
                    <td className="whitespace-nowrap px-6 py-4 text-base font-medium text-slate-800 dark:text-slate-100">
                      {e.name} {e.lastname}
                    </td>

                    {/* Edad */}
                    <td className="whitespace-nowrap px-6 py-4 text-base text-slate-700 dark:text-slate-200">
                      {e.age}
                    </td>

                    {/* Estado (Disponible / En turno / En descanso) */}
                    <td className="whitespace-nowrap px-6 py-4 text-base text-slate-700 dark:text-slate-200">
                      {e.status}
                    </td>
                  </tr>
                ))}

              {/* Sin resultados */}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No se encontraron empleados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
