// src/alertasService.js

const ALERTAS_KEY = "farmalink_alertas_log";

/**
 * Obtener todas las alertas del localStorage
 */
export function obtenerAlertas() {
  try {
    const alertas = localStorage.getItem(ALERTAS_KEY);
    return alertas ? JSON.parse(alertas) : [];
  } catch (err) {
    console.error("Error al leer alertas:", err);
    return [];
  }
}

/**
 * Registrar una nueva alerta
 * @param {string} tipo - 'info' | 'success' | 'warning' | 'error'
 * @param {string} mensaje - Descripción de la acción
 * @param {object} detalles - Información adicional (opcional)
 */
export function registrarAlerta(tipo, mensaje, detalles = null) {
  try {
    const alertas = obtenerAlertas();
    
    const nuevaAlerta = {
      id: Date.now(),
      tipo,
      mensaje,
      detalles,
      fecha: new Date().toISOString(),
      fechaLegible: new Date().toLocaleString("es-CL"),
    };

    // Agregar al inicio (más reciente primero)
    alertas.unshift(nuevaAlerta);

    // Limitar a las últimas 100 alertas
    const alertasLimitadas = alertas.slice(0, 100);

    localStorage.setItem(ALERTAS_KEY, JSON.stringify(alertasLimitadas));
    
    console.log("📢 Alerta registrada:", nuevaAlerta);
    
    return nuevaAlerta;
  } catch (err) {
    console.error("Error al registrar alerta:", err);
    return null;
  }
}

/**
 * Limpiar todas las alertas
 */
export function limpiarAlertas() {
  try {
    localStorage.removeItem(ALERTAS_KEY);
    console.log("🗑️ Alertas limpiadas");
    return true;
  } catch (err) {
    console.error("Error al limpiar alertas:", err);
    return false;
  }
}

/**
 * Funciones helper para registrar tipos específicos de alertas
 */
export const alertas = {
  info: (mensaje, detalles) => registrarAlerta("info", mensaje, detalles),
  success: (mensaje, detalles) => registrarAlerta("success", mensaje, detalles),
  warning: (mensaje, detalles) => registrarAlerta("warning", mensaje, detalles),
  error: (mensaje, detalles) => registrarAlerta("error", mensaje, detalles),
};