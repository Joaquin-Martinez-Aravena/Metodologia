import React, { useEffect, useMemo, useState } from "react";
import { getCompras, crearCompra } from "../api";

/* -----------------------------------------
   Helpers visuales
----------------------------------------- */
function StatusBadge({ value }) {
  const map = {
    Completada: "status-badge--success",
    Pendiente: "status-badge--warning",
    Cancelada: "status-badge--danger",
  };

  const variant = map[value] || "";
  return <span className={`status-badge status-badge-small ${variant}`}>{value}</span>;
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
    <section className="compras-nueva">
      <header className="compras-nueva-header">
        <h3 className="compras-nueva-title">Nueva Compra</h3>
      </header>

      <div className="compras-nueva-body">
        {/* Proveedor + Fecha */}
        <div className="compras-nueva-row">
          <label className="compras-field">
            <span className="compras-field-label">Proveedor</span>
            <select
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="form-select"
            >
              <option value="">Seleccionar proveedor</option>
              <option>Medicamentos XYZ</option>
              <option>Laboratorios ABC S.A.</option>
              <option>Farma Distribución</option>
              <option>Proveedor Genérico</option>
            </select>
          </label>

          <label className="compras-field">
            <span className="compras-field-label">Fecha de Compra</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="form-input"
            />
          </label>
        </div>

        {/* Total */}
        <div className="compras-total-box">
          Total de la compra:
          <span className="compras-total-amount">{currency(total)}</span>
        </div>

        {/* Líneas */}
        <div className="compras-lineas">
          {lineas.map((l, idx) => (
            <div key={l.id} className="compras-line-row">
              <input
                placeholder={`Producto ${idx + 1}`}
                value={l.producto}
                onChange={(e) =>
                  updateLinea(l.id, { producto: e.target.value })
                }
                className="form-input"
              />
              <input
                type="number"
                min={1}
                placeholder="Cant."
                value={l.cantidad}
                onChange={(e) =>
                  updateLinea(l.id, { cantidad: Number(e.target.value) })
                }
                className="form-input"
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
                className="form-input"
              />
              <button
                type="button"
                onClick={() => removeLinea(l.id)}
                className="btn-outline-icon"
                title="Eliminar línea"
              >
                ✕
              </button>
            </div>
          ))}

          <div className="compras-actions-row">
            <button
              type="button"
              onClick={addLinea}
              className="btn-outline"
            >
              <span className="btn-inline-icon">＋</span> Agregar línea
            </button>

            <button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              className={`btn-success-wide ${
                !canSave ? "btn-success-wide--disabled" : ""
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
    <section className="compras-historial">
      <header className="compras-historial-header">
        <h3 className="compras-historial-title">Historial de Compras</h3>
      </header>
      <div className="compras-historial-table-wrapper">
        <table className="table-main">
          <thead className="table-main-head">
            <tr>
              <th className="table-main-head-cell-sm">Proveedor</th>
              <th className="table-main-head-cell-sm">Fecha de Compra</th>
              <th className="table-main-head-cell-sm">Total (USD)</th>
              <th className="table-main-head-cell-sm">Estado</th>
              <th className="table-main-head-cell-sm">Acciones</th>
            </tr>
          </thead>
          <tbody className="table-main-body">
            {items.map((r) => (
              <tr key={r.id} className="table-main-row">
                <td className="table-cell-strong">{r.proveedor}</td>
                <td className="table-cell-muted">{r.fecha}</td>
                <td className="table-cell-total">{currency(r.total)}</td>
                <td className="table-cell">
                  <StatusBadge value={r.estado} />
                </td>
                <td className="table-cell">
                  {pendingDeleteId === r.id ? (
                    <div className="compras-confirm-delete">
                      <span className="compras-confirm-text">
                        ¿Eliminar esta compra?
                      </span>
                      <button
                        onClick={() => {
                          onDelete(r.id);
                          setPendingDeleteId(null);
                        }}
                        className="btn-danger-xs"
                      >
                        Sí, eliminar
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(null)}
                        className="btn-outline-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="compras-actions-cell">
                      <StatusBadge value={r.estado} />
                      <button
                        onClick={() => onToggleEstado(r.id)}
                        className="btn-outline-xs"
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
                        className="btn-outline-danger-xs"
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
                <td colSpan={5} className="table-main-message">
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
    estado: "Completada",
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

      const detalle = compraUI.lineas.map((linea) => ({
        id_producto: 1, // TODO: ID real del producto
        costo_unitario: linea.precio,
        cantidad: linea.cantidad,
        fecha_venc: "2026-12-31", // TODO: agregar al formulario
      }));

      const payload = {
        id_proveedor: idProveedor,
        fecha_compra: compraUI.fecha,
        total: compraUI.total,
        usuario_registra: "Sistema",
        id_usuario_registra: 1,
        detalle,
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
    <div className="compras-wrapper">
      <NuevaCompra onSave={addCompra} />

      {error && <div className="compras-error-alert">{error}</div>}

      {loading && <p className="compras-loading">Cargando compras…</p>}

      <TablaHistorial
        items={rows}
        onToggleEstado={toggleEstado}
        onDelete={deleteCompra}
      />
    </div>
  );
}
