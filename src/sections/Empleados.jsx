// src/sections/Empleados.jsx
import React, { useEffect, useState } from "react";
import { getEmpleados } from "../api";

// Pill reutilizable
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

// clases de color según estado
function statusClasses(status) {
  switch (status) {
    case "Disponible": // Verde
      return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/50";
    case "En turno": // Rojo
      return "bg-red-500/10 text-red-300 border border-red-500/50";
    case "En descanso": // Naranja
    default:
      return "bg-orange-500/10 text-orange-300 border border-orange-500/50";
  }
}

export default function Empleados() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // para añadir empleados
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    rut: "",
    name: "",
    lastname: "",
    age: "",
    status: "Disponible",
  });

  // id del empleado en modo "confirmar eliminación"
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    async function cargarEmpleadosDesdeAPI() {
      console.log("🔍 Montando Empleados: llamando getEmpleados()");
      try {
        setLoading(true);
        setError("");

        const data = await getEmpleados();

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

  // añadir empleado (solo front)
  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!form.rut || !form.name || !form.lastname || !form.age) return;

    const nuevo = {
      id: Date.now(),
      rut: form.rut,
      name: form.name,
      lastname: form.lastname,
      age: form.age,
      status: form.status,
    };

    setRows((prev) => [...prev, nuevo]);
    setForm({
      rut: "",
      name: "",
      lastname: "",
      age: "",
      status: "Disponible",
    });
    setShowForm(false);
  };

  // pedir confirmación
  const askDelete = (id) => {
    setConfirmId(id);
  };

  // confirmar eliminación
  const confirmDelete = (id) => {
    setRows((prev) => prev.filter((e) => e.id !== id));
    setConfirmId(null);
    // aquí podrías llamar a deleteEmpleado(id) cuando tengas el endpoint
  };

  // cancelar confirmación
  const cancelDelete = () => {
    setConfirmId(null);
  };

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <section className="rounded-lg border border-slate-200 bg-[var(--card-bg)] shadow-sm dark:border-slate-700">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Gestión de Empleados
          </h2>

          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <span>+</span>
            <span>Nuevo Empleado</span>
          </button>
        </header>

        {/* Formulario para añadir empleado */}
        {showForm && (
          <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
            <form
              className="grid grid-cols-1 gap-3 sm:grid-cols-5 items-end"
              onSubmit={handleAddEmployee}
            >
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-300">
                  RUT
                </label>
                <input
                  type="text"
                  value={form.rut}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rut: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="11.111.111-1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-300">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-300">
                  Apellido
                </label>
                <input
                  type="text"
                  value={form.lastname}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastname: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Apellido"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-300">
                  Edad
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.age}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, age: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Edad"
                />
              </div>
              <div className="flex items-end gap-2">
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                  className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option>Disponible</option>
                  <option>En turno</option>
                  <option>En descanso</option>
                </select>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        )}

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
                <th className="whitespace-nowrap px-6 py-4 text-left text-base font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {/* Estado: cargando */}
              {loading && (
                <tr>
                  <td
                    colSpan={5}
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
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-red-600 dark:text-red-400"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {/* Datos */}
              {!loading &&
                !error &&
                rows.map((e) => {
                  const isConfirming = confirmId === e.id;

                  return (
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

                      {/* Estado con colores */}
                      <td className="whitespace-nowrap px-6 py-4 text-base">
                        <Pill color={statusClasses(e.status)}>{e.status}</Pill>
                      </td>

                      {/* Acciones */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {!isConfirming ? (
                          <button
                            type="button"
                            onClick={() => askDelete(e.id)}
                            className="rounded-md border border-red-500 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-950/40"
                          >
                            Eliminar
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              ¿Confirmar?
                            </span>
                            <button
                              type="button"
                              onClick={() => confirmDelete(e.id)}
                              className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              onClick={cancelDelete}
                              className="rounded-md border border-slate-400 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-800/60"
                            >
                              No
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

              {/* Sin resultados */}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
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
