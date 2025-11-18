// src/sections/Compras.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getCompras, crearCompra } from "../api";

/* -----------------------------------------
   Helpers visuales
----------------------------------------- */
function StatusBadge({ value }) {
  const map = {
    Completada:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-800",
    Pendiente:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-800",
    Cancelada:
      "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-100 dark:border-rose-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
        map[value] || ""
      }`}
    >
      {value}
    </span>
  );
}

const currency = (n) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

/* -----------------------------------------
   Nueva Compra (formulario)
----------------------------------------- */
function NuevaCompra({ onSave }) {
  const [proveedor, setProveedor] = useState("");
  const [fecha, setFecha] = useState("");
  const [lineas, setLineas] = useState([
    { id: crypto.randomUUID(), producto: "", cantidad: 1, precio: 0 },
  ]);

  const total = useMemo(
    () =>
      lineas.reduce(
        (acc, l) =>
          acc + (Number(l.cantidad) || 0) * (Number(l.precio) || 0),
        0
      ),
    [lineas]
  );

  const addLinea = () =>
    setLineas((cur) => [
      ...cur,
      { id: crypto.randomUUID(), producto: "", cantidad: 1, precio: 0 },
    ]);

  const updateLinea = (id, patch) =>
    setLineas((cur) => cur.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const removeLinea = (id) =>
    setLineas((cur) => (cur.length === 1 ? cur : cur.filter((l) => l.id !== id)));

  const canSave =
    proveedor.trim() &&
    fecha &&
    lineas.length > 0 &&
    lineas.every(
      (l) =>
        l.producto.trim() && Number(l.cantidad) > 0 && Number(l.precio) >= 0
    );

  const reset = () => {
    setProveedor("");
    setFecha("");
    setLineas([
      { id: crypto.randomUUID(), producto: "", cantidad: 1, precio: 0 },
    ]);
  };

  const handleSave = () => {
    if (!canSave) return;

    onSave({
      id: crypto.randomUUID(),
      proveedor,
      fecha,
      total,
      estado: "Pendiente",
      lineas: lineas.map(({ id, ...rest }) => rest),
      createdAt: new Date().toISOString(),
    });

    reset();
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-[var(--card-bg)] shadow-sm dark:border-slate-700">
      <header className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Nueva Compra
        </h3>
      </header>

      <div className="grid gap-4 p-4">
        {/* Proveedor + Fecha */}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs text-slate-600 dark:text-slate-300">
              Proveedor
            </span>
            <select
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-600"
            >
              <option value="">Seleccionar proveedor</option>
              <option>Medicamentos XYZ</option>
              <option>Laboratorios ABC S.A.</option>
              <option>Farma Distribución</option>
              <option>Proveedor Genérico</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-slate-600 dark:text-slate-300">
              Fecha de Compra
            </span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-600"
            />
          </label>
        </div>

        {/* Total */}
        <div className="rounded-md border border-slate-300 bg-white px-4 py-3 text-right text-lg font-semibold text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300">
          Total de la compra:{" "}
          <span className="ml-1">{currency(total)}</span>
        </div>

        {/* Líneas */}
        <div className="space-y-2">
          {lineas.map((l, idx) => (
            <div
              key={l.id}
              className="grid gap-2 sm:grid-cols-[1fr_120px_140px_40px]"
            >
              <input
                placeholder={`Producto ${idx + 1}`}
                value={l.producto}
                onChange={(e) =>
                  updateLinea(l.id, { producto: e.target.value })
                }
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-600"
              />
              <input
                type="number"
                min={1}
                placeholder="Cant."
                value={l.cantidad}
                onChange={(e) =>
                  updateLinea(l.id, { cantidad: Number(e.target.value) })
                }
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-600"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Precio (USD)"
                value={l.precio}
                onChange={(e) =>
                  updateLinea(l.id, { precio: Number(e.target.value) })
                }
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-600"
              />
              <button
                type="button"
                onClick={() => removeLinea(l.id)}
                className="h-10 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                title="Eliminar línea"
              >
                ✕
              </button>
            </div>
          ))}

          <div className="grid gap-2 sm:grid-cols-[1fr_220px]">
            <button
              type="button"
              onClick={addLinea}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <span className="text-lg leading-none">＋</span> Agregar línea
            </button>

            <button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-white ${
                canSave
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-emerald-400/60 cursor-not-allowed"
              }`}
            >
              💲 Guardar Compra
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -----------------------------------------
   Tabla Historial
----------------------------------------- */

function TablaHistorial({ items, onToggleEstado, onDelete }) {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  return (
    <section className="rounded-lg border border-slate-200 bg-[var(--card-bg)] shadow-sm dark:border-slate-700">
      <header className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Historial de Compras
        </h3>
      </header>
      <div className="overflow-x-auto lg:overflow-x-visible">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-blue-50 text-slate-600 dark:bg-blue-800 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold">
                Proveedor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold">
                Fecha de Compra
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold">
                Total (USD)
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {items.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
              >
                <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                  {r.proveedor}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                  {r.fecha}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                  {currency(r.total)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={r.estado} />
                </td>
                <td className="px-4 py-3">
                  {pendingDeleteId === r.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        ¿Eliminar esta compra?
                      </span>
                      <button
                        onClick={() => {
                          onDelete(r.id);
                          setPendingDeleteId(null);
                        }}
                        className="rounded-md border border-rose-500 bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700 dark:border-rose-600"
                      >
                        Sí, eliminar
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(null)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={r.estado} />
                      <button
                        onClick={() => onToggleEstado(r.id)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                        title={
                          r.estado === "Completada"
                            ? "Marcar como Pendiente"
                            : "Marcar como Completada"
                        }
                      >
                        {r.estado === "Completada"
                          ? "Marcar Pendiente"
                          : "Marcar Completada"}
                      </button>

                      <button
                        onClick={() => setPendingDeleteId(r.id)}
                        className="rounded-md border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/30"
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  Aún no hay compras registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* -----------------------------------------
   Normalización desde la API
----------------------------------------- */

function mapListaCompras(data) {
  console.log("📦 DATA cruda Compras:", data);
  const list = Array.isArray(data) ? data : [];

  const normalizados = list.map((c) => ({
    id: c.id_compra,
    proveedor: `Proveedor #${c.id_proveedor}`,
    fecha: c.fecha_compra,
    total: c.total,
    estado: "Completada", // cuando tengas estado real, lo cambias
    userName: c.usuario_registra ?? "—",
    userId: c.id_usuario_registra,
  }));

  console.log("📦 Compras normalizadas:", normalizados);
  return normalizados;
}

/* -----------------------------------------
   Vista principal de Compras
----------------------------------------- */
export default function Compras() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargarComprasDesdeAPI() {
    console.log("🔍 Montando Compras: llamando getCompras()");

    try {
      setLoading(true);
      setError("");

      const data = await getCompras();

      if (data && data.__error) {
        console.warn("⚠ Error lógico getCompras:", data);
        setError(
          `No se pudieron cargar las compras${
            data.status ? ` (status: ${data.status})` : ""
          }`
        );
        setRows([]);
        return;
      }

      const mapped = mapListaCompras(data);
      setRows(mapped);
    } catch (err) {
      console.error("💥 Excepción en cargarCompras:", err);
      setError("No se pudieron cargar las compras desde la API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarComprasDesdeAPI();
  }, []);

  const addCompra = async (compraUI) => {
  try {
    const proveedorMap = {
      "Medicamentos XYZ": 1,
      "Laboratorios ABC S.A.": 2,
      "Farma Distribución": 3,
      "Proveedor Genérico": 4,
    };

    const idProveedor = proveedorMap[compraUI.proveedor] || 1;

    // Convertir las líneas con TODOS los campos requeridos
    const detalle = compraUI.lineas.map((linea) => ({
      id_producto: 1, // TODO: Este debe ser el ID real del producto de tu BD
      costo_unitario: linea.precio,
      cantidad: linea.cantidad,
      fecha_venc: "2026-12-31", // TODO: Agregar campo de fecha de vencimiento en el formulario
    }));

    const payload = {
      id_proveedor: idProveedor,
      fecha_compra: compraUI.fecha,
      total: compraUI.total,
      usuario_registra: "Sistema",
      id_usuario_registra: 1,
      detalle: detalle,
    };

    console.log("📤 Enviando compra al backend:", JSON.stringify(payload, null, 2));

    const resp = await crearCompra(payload);
    console.log("📥 Respuesta del backend:", resp);

    if (resp.__error) {
      console.error("❌ Error:", resp);
      setError("No se pudo guardar la compra. Revisa la consola para más detalles.");
      return;
    }

    console.log("✅ Compra guardada exitosamente!");
    await cargarComprasDesdeAPI();
    setError("");

  } catch (err) {
    console.error("💥 Excepción:", err);
    setError("Error al guardar la compra.");
  }
};

  const toggleEstado = (id) =>
    setRows((cur) =>
      cur.map((c) =>
        c.id === id
          ? {
              ...c,
              estado: c.estado === "Completada" ? "Pendiente" : "Completada",
            }
          : c
      )
    );

  const deleteCompra = (id) =>
    setRows((cur) => cur.filter((c) => c.id !== id));

  return (
    <div className="mx-auto w-full max-w-[2000px] px-2 sm:px-4 lg:px-8 xl:px-10 space-y-6">
      <NuevaCompra onSave={addCompra} />
      {error && (
        <div className="rounded-md border border-rose-500 bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:border-rose-600 dark:bg-rose-900/20 dark:text-rose-200">
          {error}
        </div>
      )}
      {loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cargando compras…
        </p>
      )}
      <TablaHistorial
        items={rows}
        onToggleEstado={toggleEstado}
        onDelete={deleteCompra}
      />
    </div>
  );
}