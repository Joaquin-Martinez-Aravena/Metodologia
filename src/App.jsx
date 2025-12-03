import React, { useMemo, useState, useEffect } from "react";
import Sidebar from "./components/Sidebar.jsx";
import { Productos, Compras, Empleados, Alertas, Pagos } from "./sections";

// Usuarios disponibles (mock login)
const USERS = {
  "Administrador@gmail.com": { password: "adm123", role: "admin" },
  "Empleado@gmail.com": { password: "empleado123", role: "employee" },
};

// Formulario de inicio de sesión
function LoginPanel({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const u = USERS[email?.trim()];
    if (u && u.password === pass) {
      onLogin({ email, role: u.role });
    } else {
      setErr("Correo o contraseña inválidos.");
    }
  };

  return (
    <div className="login-page-wrapper">
      <form onSubmit={handleSubmit} className="login-card">
        <h1 className="login-title">FarmaLink — Iniciar sesión</h1>

        <label className="login-label">Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          placeholder="usuario@dominio.cl"
          required
        />

        <label className="login-label">Contraseña</label>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="login-input"
          placeholder="••••••••"
          required
        />

        {err && <p className="login-error">{err}</p>}

        <button type="submit" className="login-button w-full">
          Entrar
        </button>

        <div className="login-hint">
          Admin: Administrador@gmail.com / adm123 <br />
          Empleado: Empleado@gmail.com / empleado123
        </div>
      </form>
    </div>
  );
}

// ErrorBoundary (para evitar caídas de render)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("App render error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h1 className="error-fallback-title">Se rompió el render 😵‍💫</h1>
          <p>
            <span className="error-fallback-strong">Error:</span>{" "}
            {this.state.error?.message || String(this.state.error)}
          </p>
          <p className="error-fallback-detail">
            Revisa la consola del navegador (F12 → Console) para más detalle.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Secciones disponibles
const SECTIONS = {
  productos: Productos,
  compras: Compras,
  pagos: Pagos,        // 👈 sigue existiendo, solo admin podrá verlo
  empleados: Empleados,
  alertas: Alertas,
};

// Dashboard de inventario CONECTADO A LA API
function InventoryDashboard() {
  const [stats, setStats] = useState({
    stockLow: 0,
    porVencer: 0,
    vencidos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarEstadisticas() {
      try {
        setLoading(true);

        const response = await fetch(
          "https://metodologia-api.onrender.com"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("📊 Estadísticas del dashboard:", data);

        setStats({
          stockLow: data.stock_bajo ?? 0,
          porVencer: data.por_vencer ?? 0,
          vencidos: data.vencidos ?? 0,
        });
      } catch (err) {
        console.error("💥 Error al cargar estadísticas del dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarEstadisticas();
  }, []);

  const StatCard = ({ value, label, tone = "amber" }) => {
    const toneClass =
      tone === "orange"
        ? "stat-card--orange"
        : tone === "red"
        ? "stat-card--red"
        : "stat-card--amber";

    return (
      <div className={`stat-card ${toneClass}`}>
        <div className="stat-card-number">
          {loading ? "..." : value}
        </div>
        <div className="stat-card-sub">{label}</div>
      </div>
    );
  };

  return (
    <div className="inventory-dashboard">
      <h2 className="inventory-title">Dashboard de Inventario</h2>
      <div className="inventory-grid">
        <StatCard value={stats.stockLow} label="Stock Bajo" tone="amber" />
        <StatCard value={stats.porVencer} label="Por Vencer" tone="orange" />
        <StatCard value={stats.vencidos} label="Vencidos" tone="red" />
      </div>
    </div>
  );
}

function HomeButton({ onReset }) {
  return (
    <button
      onClick={onReset}
      className="home-button"
      title="Salir de la sección activa"
    >
      🏠
    </button>
  );
}

/* ========== APP PRINCIPAL ========== */
export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("farma_user")) ?? null;
    } catch {
      return null;
    }
  });
  const [section, setSection] = useState("productos");

  const onLogin = (u) => {
    setUser(u);
    sessionStorage.setItem("farma_user", JSON.stringify(u));
  };
  const onLogout = () => {
    setUser(null);
    setSection("");
    sessionStorage.removeItem("farma_user");
  };

  // ⛔ Pagos SOLO para admin
  const allowedKeys =
    user?.role === "admin"
      ? ["productos", "compras", "pagos", "empleados", "alertas"] // admin SÍ ve pagos
      : user?.role === "employee"
      ? ["productos", "compras"]                                  // empleado NO ve pagos
      : [];

  const safeSection = allowedKeys.includes(section)
    ? section
    : allowedKeys[0] ?? "";

  const CurrentView = useMemo(
    () => SECTIONS[safeSection] ?? (() => null),
    [safeSection]
  );

  if (!user) return <LoginPanel onLogin={onLogin} />;

  return (
    <ErrorBoundary>
      <div className="app-root">
        {/* HEADER */}
        <header className="app-header">
          <div className="app-header-inner">
            <div className="app-header-user">
              <HomeButton onReset={() => setSection("")} />
              <span className="app-header-user-text">
                {user.email} ({user.role})
              </span>
            </div>
            <h1 className="app-title">💊 FarmaLink 💊</h1>
            <p className="app-subtitle">Sistema de Gestión de Inventario</p>
          </div>
        </header>

        {/* LAYOUT PRINCIPAL */}
        <div className="app-layout">
          {/* Sidebar fijo */}
          <aside className="app-sidebar-shell">
            <Sidebar
              active={safeSection}
              onSelect={(key) => allowedKeys.includes(key) && setSection(key)}
              role={user.role}
              onLogout={onLogout}
            />
          </aside>

          {/* Contenido principal */}
          <main className="app-main">
            {safeSection && <InventoryDashboard />}
            <CurrentView />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
