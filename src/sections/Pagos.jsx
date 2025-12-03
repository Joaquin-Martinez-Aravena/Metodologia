// src/sections/Pagos.jsx
import React, { useState } from "react";

export default function Pagos() {
  const [pagos, setPagos] = useState([]); // 👈 TABLA VACÍA AL INICIO

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    rut: "",
    fecha: "",
    monto: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

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

  const registrarPago = (e) => {
    e.preventDefault();

    const nuevoPago = {
      id: pagos.length + 1,
      nombre: formData.nombre,
      rut: formData.rut,
      fecha: formData.fecha,
      monto: formData.monto,
      pagado: true,
    };

    setPagos((prev) => [...prev, nuevoPago]);
    setShowForm(false);

    // Notificación bonita
    setSuccessMessage("Pago realizado correctamente.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Notificación */}
      {successMessage && (
        <div className="px-4 py-2 bg-emerald-600/20 border border-emerald-400 text-emerald-300 rounded-md text-sm">
          ✔ {successMessage}
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
              <th className="px-4 py-3 text-left font-semibold text-slate-200">
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
            {pagos.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-slate-400 text-sm"
                >
                  No hay pagos registrados.
                </td>
              </tr>
            ) : (
              pagos.map((pago) => (
                <tr
                  key={pago.id}
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
