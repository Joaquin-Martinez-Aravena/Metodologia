// src/sections/Pagos.jsx
import React, { useState, useEffect } from "react";
import { getPagos, crearPago } from "../api";
import { alertas } from "../alertasService";

export default function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    rut: "",
    fecha: "",
    monto: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  // Cargar pagos al montar el componente
  useEffect(() => {
    cargarPagosDesdeAPI();
  }, []);

  async function cargarPagosDesdeAPI() {
    console.log("🔍 Cargando pagos desde la API...");

    try {
      setLoading(true);
      setError("");

      const data = await getPagos();

      if (data && data.__error) {
        console.warn("⚠️ Error lógico getPagos:", data);
        setError("No se pudieron cargar los pagos desde el servidor.");
        setPagos([]);
        return;
      }

      // Normalizar los datos de la API
      const pagosNormalizados = Array.isArray(data)
        ? data.map((p) => ({
            id: p.id_pago,
            nombre: p.nombre,
            rut: p.rut,
            fecha: p.fecha_pago,
            monto: p.monto_a_pagar,
            pagado: true, // Los pagos registrados siempre están pagados
          }))
        : [];

      console.log("📦 Pagos normalizados:", pagosNormalizados);
      setPagos(pagosNormalizados);
    } catch (err) {
      console.error("💥 Excepción en cargarPagos:", err);
      setError("Error al cargar los pagos.");
      setPagos([]);
    } finally {
      setLoading(false);
    }
  }

  const abrirFormulario = () => {
    setShowForm(true);
    setFormData({ nombre: "", rut: "", fecha: "", monto: "" });
  };

  const cerrarFormulario = () => {
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const registrarPago = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        nombre: formData.nombre,
        rut: formData.rut,
        monto_a_pagar: Number(formData.monto),
        fecha_pago: formData.fecha,
      };

      console.log("📤 Enviando pago al backend:", payload);

      const resp = await crearPago(payload);

      if (resp.__error) {
        console.error("❌ Error al crear pago:", resp);

        // Registrar alerta de error
        alertas.error(`Error al registrar pago: ${formData.nombre}`, {
          rut: formData.rut,
          monto: formData.monto,
          error: resp,
        });

        alert("No se pudo registrar el pago. Revisa la consola.");
        return;
      }

      console.log("✅ Pago registrado exitosamente:", resp);

      // Registrar alerta de éxito
      alertas.success(
        `Pago registrado: ${formData.nombre} - $${Number(
          formData.monto
        ).toLocaleString("es-CL")}`,
        {
          id_pago: resp.id_pago,
          nombre: formData.nombre,
          rut: formData.rut,
          monto: formData.monto,
          fecha: formData.fecha,
        }
      );

      // Recargar lista de pagos
      await cargarPagosDesdeAPI();

      setShowForm(false);

      // Notificación de éxito
      setSuccessMessage("Pago realizado correctamente.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("💥 Excepción al registrar pago:", err);

      // Registrar alerta de excepción
      alertas.error(`Excepción al registrar pago: ${err.message}`, {
        stack: err.stack,
      });

      alert("Error inesperado al registrar el pago.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Notificación de éxito */}
      {successMessage && (
        <div className="px-4 py-2 bg-emerald-600/20 border border-emerald-400 text-emerald-300 rounded-md text-sm">
          ✔ {successMessage}
        </div>
      )}

      {/* Notificación de error */}
      {error && (
        <div className="px-4 py-2 bg-rose-600/20 border border-rose-400 text-rose-300 rounded-md text-sm">
          ✖ {error}
        </div>
      )}

      {/* Header con botón */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-100">
          Gestión de Pagos
        </h2>

        <button
          onClick={abrirFormulario}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + Realizar Pago
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/70">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-900/50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">
                RUT
              </th>
              <th className="px-4 py-3 text-left font-semibibold text-slate-200">
                Nombre
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">
                Fecha
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">
                Monto
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">
                Estado
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-slate-400 text-sm"
                >
                  Cargando pagos...
                </td>
              </tr>
            ) : pagos.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-slate-400 text-sm"
                >
                  No hay pagos registrados.
                </td>
              </tr>
            ) : (
              pagos.map((pago, index) => (
                <tr
                  key={pago.id || `pago-${index}`} // ← fallback con index si no hay id
                  className="border-t border-slate-800 hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 text-slate-100">{pago.rut}</td>
                  <td className="px-4 py-3 text-slate-100">{pago.nombre}</td>
                  <td className="px-4 py-3 text-slate-200">
                    {pago.fecha || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    {pago.monto
                      ? `$${Number(pago.monto).toLocaleString("es-CL")}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {pago.pagado ? (
                      <span className="inline-block px-3 py-1 text-xs rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-400">
                        Pagado
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 text-xs rounded-full bg-red-500/10 border border-red-500 text-red-400">
                        No Pagado
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FORMULARIO */}
      {showForm && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-100">
              Realizar Pago
            </h3>
            <button
              onClick={cerrarFormulario}
              className="text-slate-400 hover:text-slate-200 text-sm"
            >
              ✕ Cerrar
            </button>
          </div>

          <form
            onSubmit={registrarPago}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Nombre */}
            <div>
              <label className="text-sm text-slate-300">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-600 text-slate-100 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* RUT */}
            <div>
              <label className="text-sm text-slate-300">RUT</label>
              <input
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-600 text-slate-100 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="text-sm text-slate-300">Fecha</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-600 text-slate-100 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Monto */}
            <div>
              <label className="text-sm text-slate-300">Monto</label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-600 text-slate-100 focus:ring-2 focus:ring-emerald-500"
                placeholder="Ej: 450000"
                required
                min="0"
              />
            </div>

            {/* Botones */}
            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={cerrarFormulario}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md"
              >
                Registrar Pago
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
