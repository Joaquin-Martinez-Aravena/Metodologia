// src/components/Sidebar.jsx
import React from "react";

export default function Sidebar({ active, onSelect, role }) {
  const menuItems = [
    { key: "productos", label: "Productos", icon: "💊" },      // Medicamentos
    { key: "compras",   label: "Compras",   icon: "🛒" },      // Carrito
    ...(role === "admin"
      ? [
          { key: "empleados", label: "Empleados", icon: "👥" }, // Personal
          { key: "alertas",   label: "Alertas",   icon: "⚠️" }, // Alertas
        ]
      : []),
  ];

  return (
    <div className="group relative h-full">
      {/* Zona de hover */}
      <div
        className="absolute inset-y-0 inset-x-0 z-20 cursor-pointer"
        aria-hidden="true"
      />

      {/* Panel deslizante */}
      <div
        className="
          pointer-events-none
          absolute inset-y-0 left-0 z-30
          w-64
          -translate-x-[290px]         /* casi todo oculto */
          group-hover:translate-x-0
          transition-transform duration-200 ease-out
        "
      >
        <nav
          className="
            pointer-events-auto
            h-full w-64
            px-3 py-4
            border-r shadow-xl
            bg-slate-50 text-slate-900
            border-slate-200
            dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800
          "
        >
          <div className="mb-3 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Menú
          </div>

          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = active === item.key;
              return (
                <li key={item.key}>
                  <button
                    onClick={() => onSelect(item.key)}
                    className={[
                      "w-full text-left rounded-md px-3 py-2 text-sm font-medium transition flex items-center gap-3",
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800",
                    ].join(" ")}
                  >
                    {/* Icono con Tailwind */}
                    <span
                      className={[
                        "flex h-7 w-7 items-center justify-center rounded-md text-base",
                        isActive
                          ? "bg-indigo-500/80 text-white"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100",
                      ].join(" ")}
                    >
                      {item.icon}
                    </span>

                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="pointer-events-none absolute top-0 right-0 h-full w-2 bg-gradient-to-r from-black/10 to-transparent dark:from-black/30" />
        </nav>
      </div>
    </div>
  );
}
