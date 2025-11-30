// src/components/Sidebar.jsx
import React from "react";

export default function Sidebar({ active, onSelect, role, onLogout }) {
  const menuItems = [
    { key: "productos", label: "Productos", icon: "💊" },
    { key: "compras", label: "Compras", icon: "🛒" },
    ...(role === "admin"
      ? [
          { key: "empleados", label: "Empleados", icon: "👥" },
          { key: "alertas", label: "Alertas", icon: "⚠️" },
        ]
      : []),
  ];

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="group sidebar-root">
      {/* Zona de hover para abrir el panel */}
      <div className="sidebar-hover-zone" aria-hidden="true" />

      {/* Panel deslizante */}
      <div className="sidebar-panel">
        <nav className="sidebar-nav">
          <div className="sidebar-title">Menú</div>

          <ul className="sidebar-menu">
            {menuItems.map((item) => {
              const isActive = active === item.key;
              const itemClasses = `sidebar-item ${
                isActive ? "sidebar-item--active" : ""
              }`;
              const iconClasses = `sidebar-icon ${
                isActive ? "sidebar-icon--active" : ""
              }`;

              return (
                <li key={item.key}>
                  <button
                    onClick={() => onSelect(item.key)}
                    className={itemClasses}
                  >
                    <span className={iconClasses}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Botón Salir en el sidebar */}
          <button
            type="button"
            onClick={handleLogoutClick}
            className="sidebar-logout"
          >
            <span className="sidebar-logout-icon">🚪</span>
            <span>Salir</span>
          </button>

          <div className="sidebar-gradient" />
        </nav>
      </div>
    </div>
  );
}
