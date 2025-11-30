// src/sections/Empleados.jsx
import React, { useEffect, useState } from "react";
import { getEmpleados } from "../api";

// Pill reutilizable
const Pill = ({ children, variant }) => (
  <span className={`pill-status ${variant}`}>{children}</span>
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

// clases de color según estado (mapeo a variantes de CSS)
function statusVariant(status) {
  switch (status) {
    case "Disponible":
      return "pill-status--disponible"; // Verde
    case "En turno":
      return "pill-status--enturno"; // Rojo
    case "En descanso":
    default:
      return "pill-status--descanso"; // Naranja
  }
}

export default function Empleados() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // para añadir empleados (solo front)
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
    <div className="empleados-wrapper">
      <section className="empleados-section">
        <header className="empleados-header">
          <h2 className="empleados-title">Gestión de Empleados</h2>

          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="empleados-add-btn"
          >
            <span>+</span>
            <span>Nuevo Empleado</span>
          </button>
        </header>

        {/* Formulario para añadir empleado */}
        {showForm && (
          <div className="empleados-form-container">
            <form className="empleados-form" onSubmit={handleAddEmployee}>
              <div className="empleados-field">
                <label className="empleados-field-label">RUT</label>
                <input
                  type="text"
                  value={form.rut}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rut: e.target.value }))
                  }
                  className="empleados-input"
                  placeholder="11.111.111-1"
                />
              </div>

              <div className="empleados-field">
                <label className="empleados-field-label">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="empleados-input"
                  placeholder="Nombre"
                />
              </div>

              <div className="empleados-field">
                <label className="empleados-field-label">Apellido</label>
                <input
                  type="text"
                  value={form.lastname}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastname: e.target.value }))
                  }
                  className="empleados-input"
                  placeholder="Apellido"
                />
              </div>

              <div className="empleados-field">
                <label className="empleados-field-label">Edad</label>
                <input
                  type="number"
                  min="0"
                  value={form.age}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, age: e.target.value }))
                  }
                  className="empleados-input"
                  placeholder="Edad"
                />
              </div>

              <div className="empleados-field empleados-field-actions">
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                  className="empleados-select"
                >
                  <option>Disponible</option>
                  <option>En turno</option>
                  <option>En descanso</option>
                </select>
                <button type="submit" className="empleados-save-btn">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table-main">
            <thead className="table-main-head">
              <tr>
                <th className="table-main-head-cell">RUT</th>
                <th className="table-main-head-cell">Nombre</th>
                <th className="table-main-head-cell">Edad</th>
                <th className="table-main-head-cell">Estado</th>
                <th className="table-main-head-cell">Acciones</th>
              </tr>
            </thead>

            <tbody className="table-main-body">
              {/* Estado: cargando */}
              {loading && (
                <tr>
                  <td colSpan={5} className="table-main-message">
                    Cargando empleados…
                  </td>
                </tr>
              )}

              {/* Estado: error */}
              {!loading && error && (
                <tr>
                  <td colSpan={5} className="table-main-message-error">
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
                    <tr key={e.id} className="table-main-row">
                      {/* RUT */}
                      <td className="table-cell-muted">{e.rut}</td>

                      {/* Nombre + Apellido */}
                      <td className="table-cell-strong">
                        {e.name} {e.lastname}
                      </td>

                      {/* Edad */}
                      <td className="table-cell">{e.age}</td>

                      {/* Estado con colores */}
                      <td className="table-cell">
                        <Pill variant={statusVariant(e.status)}>
                          {e.status}
                        </Pill>
                      </td>

                      {/* Acciones */}
                      <td className="table-cell-actions">
                        {!isConfirming ? (
                          <button
                            type="button"
                            onClick={() => askDelete(e.id)}
                            className="btn-delete-main"
                          >
                            Eliminar
                          </button>
                        ) : (
                          <div className="empleados-confirm-actions">
                            <span className="empleados-confirm-text">
                              ¿Confirmar?
                            </span>
                            <button
                              type="button"
                              onClick={() => confirmDelete(e.id)}
                              className="btn-danger-xs"
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              onClick={cancelDelete}
                              className="btn-outline-xs"
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
                  <td colSpan={5} className="table-main-message">
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
