import React, { useEffect, useMemo, useState } from "react";
import { getProductos, crearProducto } from "../api";
import { alertas } from "../alertasService";

/* -----------------------------------------
   Badges y helpers pequeños
----------------------------------------- */
function StatusBadge({ value }) {
  const map = {
    Activo: "status-badge--active",
    Inactivo: "status-badge--inactive",
    ACT: "status-badge--active", // por si llega directo desde la API
  };

  const variant = map[value] || "";
  return <span className={`status-badge ${variant}`}>{value}</span>;
}

function Pill({ children }) {
  return <span className="pill">{children}</span>;
}

/* -----------------------------------------
   Modal para crear producto
----------------------------------------- */
function AddProductModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    category: "",
    threshold: "",
    status: "Activo",
  });

  const disabled =
    !form.code.trim() ||
    !form.name.trim() ||
    !form.category.trim() ||
    !String(form.threshold).trim();

  if (!open) return null;

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = () => {
    onCreate({
      code: form.code.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      threshold: Number(form.threshold),
      status: form.status,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <header className="modal-header">
          <h3 className="modal-title">Nuevo Producto</h3>
          <button onClick={onClose} className="modal-close">
            Cerrar
          </button>
        </header>

        <div className="modal-body">
          <label className="modal-field">
            <span className="modal-field-text">Código</span>
            <input
              value={form.code}
              onChange={handleChange("code")}
              className="modal-input"
              placeholder="PARA001"
            />
          </label>

          <label className="modal-field">
            <span className="modal-field-text">Nombre</span>
            <input
              value={form.name}
              onChange={handleChange("name")}
              className="modal-input"
              placeholder="Paracetamol 500mg"
            />
          </label>

          <label className="modal-field">
            <span className="modal-field-text">Categoría (texto)</span>
            <input
              value={form.category}
              onChange={handleChange("category")}
              className="modal-input"
              placeholder="Analgésicos"
            />
          </label>

          <label className="modal-field">
            <span className="modal-field-text">Umbral Stock</span>
            <input
              type="number"
              min={0}
              value={form.threshold}
              onChange={handleChange("threshold")}
              className="modal-input"
              placeholder="10"
            />
          </label>

          <label className="modal-field">
            <span className="modal-field-text">Estado</span>
            <select
              value={form.status}
              onChange={handleChange("status")}
              className="modal-select"
            >
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
          </label>
        </div>

        <footer className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button
            disabled={disabled}
            onClick={handleSubmit}
            className={`btn-success ${
              disabled ? "btn-success--disabled" : ""
            }`}
          >
            Crear
          </button>
        </footer>
      </div>
    </div>
  );
}

/* -----------------------------------------
   Normalizador para la lista de productos
----------------------------------------- */
function mapListaProductos(data) {
  console.log("📦 DATA cruda desde la API:", data);

  const list = Array.isArray(data) ? data : [];

  const normalizados = list.map((p) => ({
    id: p.id_producto,
    code: p.cod_producto,
    name: p.nombre,
    category: `Categoría ${p.id_categoria}`,
    threshold: p.umbral_stock,
    status: p.estado === "ACT" ? "Activo" : "Inactivo",
  }));

  console.log("📦 Productos normalizados:", normalizados);
  return normalizados;
}

/* -----------------------------------------
   Vista principal de Productos
----------------------------------------- */
export default function Productos() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = useMemo(() => {
    const set = new Set(rows.map((r) => r.category));
    return ["Todas", ...Array.from(set)];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return rows.filter((r) => {
      const okQuery =
        !q ||
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);
      const okCat = categoryFilter === "Todas" || r.category === categoryFilter;
      return okQuery && okCat;
    });
  }, [rows, query, categoryFilter]);

  const cargarProductosDesdeAPI = async () => {
    console.log("🔍 Montando Productos: llamando getProductos()");
    try {
      setLoading(true);
      setError("");
      const data = await getProductos();

      if (data && data.__error) {
        console.warn("⚠️ Error lógico getProductos:", data);
        setError(
          `No se pudieron cargar los productos${
            data.status ? ` (status: ${data.status})` : ""
          }`
        );
        setRows([]);
        return;
      }

      const mapped = mapListaProductos(data);
      setRows(mapped);
    } catch (err) {
      console.error("🚨 Excepción en cargarProductos:", err);
      setError("No se pudieron cargar los productos desde la API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductosDesdeAPI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCrearProducto = async (draft) => {
    console.log("🟢 POST creando producto:", draft);

    try {
      let idCategoria = 1;
      if (/antib/i.test(draft.category)) idCategoria = 2;
      if (/vitam/i.test(draft.category)) idCategoria = 3;

      const payload = {
        cod_producto: draft.code,
        nombre: draft.name,
        id_categoria: idCategoria,
        umbral_stock: draft.threshold,
        estado: draft.status === "Activo" ? "ACT" : "INA",
      };

      const resp = await crearProducto(payload);

      if (resp && resp.__error) {
        console.warn("⚠️ Error al crear producto:", resp);
        
        // 📢 Registrar alerta de error
        alertas.error(
          `Error al crear producto: ${draft.name}`,
          {
            codigo: draft.code,
            nombre: draft.name,
            error: resp
          }
        );
        
        alert(
          "No se pudo crear el producto en la API (revisa la consola para más detalle)."
        );
        return;
      }

      // 📢 Registrar alerta de éxito
      alertas.success(
        `Producto creado: ${draft.name} (${draft.code})`,
        {
          id_producto: resp.id_producto,
          codigo: draft.code,
          nombre: draft.name,
          categoria: draft.category,
          umbral_stock: draft.threshold,
          estado: draft.status
        }
      );

      await cargarProductosDesdeAPI();
      setOpenCreate(false);
      
    } catch (err) {
      console.error("💥 Excepción al crear producto:", err);
      
      // 📢 Registrar alerta de excepción
      alertas.error(
        `Excepción al crear producto: ${err.message}`,
        { stack: err.stack }
      );
      
      alert("Error inesperado al crear el producto.");
    }
  };

  return (
    <div className="productos-wrapper">
      <section className="productos-section">
        <header className="productos-header">
          <h2 className="productos-title">Gestión de Productos</h2>

          <div className="productos-header-actions">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="productos-filter-select"
              title="Filtrar por categoría"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={() => setOpenCreate(true)}
              className="btn-new-product"
            >
              <span className="btn-new-product-icon">+</span>
              <span>Nuevo Producto</span>
            </button>
          </div>
        </header>

        <div className="productos-toolbar">
          <div className="productos-search-wrapper">
            <span className="productos-search-icon">🔎</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos… (código, nombre, categoría)"
              className="productos-search-input"
            />
          </div>

          {error && <div className="productos-error-alert">{error}</div>}
        </div>

        <div className="overflow-x-auto">
          <table className="table-main">
            <thead className="table-main-head">
              <tr>
                <th className="table-main-head-cell">Código</th>
                <th className="table-main-head-cell">Nombre</th>
                <th className="table-main-head-cell">Categoría</th>
                <th className="table-main-head-cell">Umbral Stock</th>
                <th className="table-main-head-cell">Estado</th>
              </tr>
            </thead>
            <tbody className="table-main-body">
              {loading && (
                <tr>
                  <td colSpan={5} className="table-main-message">
                    Cargando productos…
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((r) => (
                  <tr key={r.id} className="table-main-row">
                    <td className="table-cell-muted">{r.code}</td>
                    <td className="table-cell-strong">{r.name}</td>
                    <td className="table-cell">
                      <Pill>{r.category}</Pill>
                    </td>
                    <td className="table-cell">{r.threshold}</td>
                    <td className="table-cell">
                      <StatusBadge value={r.status} />
                    </td>
                  </tr>
                ))}

              {!loading && filtered.length === 0 && !error && (
                <tr>
                  <td colSpan={5} className="table-main-message">
                    No se encontraron productos para "{query}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AddProductModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreate={handleCrearProducto}
      />
    </div>
  );
}