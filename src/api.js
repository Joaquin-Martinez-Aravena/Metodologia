// src/api.js

// URL base del backend en Render (SIN slash final)
const BASE_URL = (process.env.API_URL || "https://metodologia-api.onrender.com").replace(/\/+$/, "");

// =======================
//      PRODUCTOS
// =======================

const PRODUCTOS_URL = `${BASE_URL}/api/productos/`;

// GET /api/productos/
export async function getProductos() {
  const url = PRODUCTOS_URL;
  console.log("➡️ GET", url);

  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log("ℹ️ Respuesta bruta getProductos:", res.status, text);

    if (!res.ok) {
      return { __error: true, status: res.status, raw: text };
    }

    const data = text ? JSON.parse(text) : [];
    console.log("✅ JSON getProductos:", data);
    return data;
  } catch (err) {
    console.error("❌ Falla de red en getProductos:", err);
    return { __error: true, network: true, message: String(err) };
  }
}

// POST /api/productos/
export async function crearProducto(data) {
  const url = PRODUCTOS_URL;
  console.log("➡️ POST", url, data);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const text = await res.text();
    console.log("ℹ️ Respuesta bruta crearProducto:", res.status, text);

    if (!res.ok) {
      return { __error: true, status: res.status, raw: text };
    }

    const json = text ? JSON.parse(text) : {};
    console.log("✅ JSON crearProducto:", json);
    return json;
  } catch (err) {
    console.error("❌ Falla de red en crearProducto:", err);
    return { __error: true, network: true, message: String(err) };
  }
}

// ========================
//        EMPLEADOS
// ========================

export async function getEmpleados() {
  const url = `${BASE_URL}/api/empleados/`;
  console.log("🔍 GET", url);

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("✅ JSON getEmpleados:", data);

    if (!res.ok) {
      console.warn("⚠️ Error getEmpleados:", res.status, data);
      return { __error: true, status: res.status, data };
    }

    return data;
  } catch (err) {
    console.error("💥 Excepción getEmpleados:", err);
    return { __error: true, status: 0, data: null, error: String(err) };
  }
}

export async function crearEmpleado(body) {
  const url = `${BASE_URL}/api/empleados/`;
  console.log("🔍 POST", url, body);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("✅ JSON crearEmpleado:", data);

    if (!res.ok) {
      console.warn("⚠️ Error crearEmpleado:", res.status, data);
      return { __error: true, status: res.status, data };
    }

    return data;
  } catch (err) {
    console.error("💥 Excepción crearEmpleado:", err);
    return { __error: true, status: 0, data: null, error: String(err) };
  }
}

// ========================
//         COMPRAS
// ========================

export async function getCompras() {
  const url = `${BASE_URL}/api/compras/`;
  console.log("🔍 GET", url);

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("✅ JSON getCompras:", data);

    if (!res.ok) {
      console.warn("⚠️ Error getCompras:", res.status, data);
      return { __error: true, status: res.status, data };
    }

    return data;
  } catch (err) {
    console.error("💥 Excepción getCompras:", err);
    return { __error: true, status: 0, data: null, error: String(err) };
  }
}

export async function crearCompra(body) {
  const url = `${BASE_URL}/api/compras/`;
  console.log("🔍 POST", url, body);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("✅ JSON crearCompra:", data);

    if (!res.ok) {
      console.warn("⚠️ Error crearCompra:", res.status, data);
      return { __error: true, status: res.status, data };
    }

    return data;
  } catch (err) {
    console.error("💥 Excepción crearCompra:", err);
    return { __error: true, status: 0, data: null, error: String(err) };
  }
}

// ========================
//         ALERTAS
// ========================

export async function getAlertas() {
  const url = `${BASE_URL}/api/alertas/`;
  console.log("🔍 GET", url);

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("✅ JSON getAlertas:", data);

    if (!res.ok) {
      console.warn("⚠️ Error getAlertas:", res.status, data);
      return { __error: true, status: res.status, data };
    }

    return data;
  } catch (err) {
    console.error("💥 Excepción getAlertas:", err);
    return { __error: true, status: 0, data: null, error: String(err) };
  }
}

export async function crearAlertas(body) {
  const url = `${BASE_URL}/api/alertas/`;
  console.log("🔍 POST", url, body);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("✅ JSON crearAlertas:", data);

    if (!res.ok) {
      console.warn("⚠️ Error crearAlertas:", res.status, data);
      return { __error: true, status: res.status, data };
    }

    return data;
  } catch (err) {
    console.error("💥 Excepción crearAlertas:", err);
    return { __error: true, status: 0, data: null, error: String(err) };
  }
}

// DELETE /api/compras/{id_compra}
export async function eliminarCompra(idCompra) {
  const url = `${BASE_URL}/api/compras/${idCompra}`;
  console.log("🔍 DELETE", url);

  try {
    const res = await fetch(url, {
      method: "DELETE",
    });

    // Si es 200 con body, parsear JSON
    // Si es 204 (No Content), no hay body
    if (res.status === 204) {
      console.log("✅ Compra eliminada (204 No Content)");
      return { success: true };
    }

    const data = await res.json();
    console.log("✅ JSON eliminarCompra:", data);

    if (!res.ok) {
      console.warn("⚠️ Error eliminarCompra:", res.status, data);
      return { __error: true, status: res.status, data };
    }

    return data;
  } catch (err) {
    console.error("💥 Excepción eliminarCompra:", err);
    return { __error: true, status: 0, data: null, error: String(err) };
  }
}