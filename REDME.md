# FarmaLink

Sistema de gestión farmacéutica con React + Tailwind CSS.

## 📋 Requisitos

- Node.js v16+ instalado
- npm o yarn

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio
\`\`\`bash
git clone <tu-repo>
cd farmalink
\`\`\`

### 2. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 3. Ejecutar en desarrollo
\`\`\`bash
npm run dev
\`\`\`

La aplicación se abrirá en `http://localhost:1234`

### 4. Build para producción
\`\`\`bash
npm run build
\`\`\`

## 🔐 Credenciales de prueba

**Administrador:**
- Email: `Administrador@gmail.com`
- Contraseña: `adm123`

**Empleado:**
- Email: `Empleado@gmail.com`
- Contraseña: `empleado123`

## 📁 Estructura del proyecto

\`\`\`
farmalink/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   └── Sidebar.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
└── .postcssrc.json
\`\`\`

## 🛠️ Tecnologías

- **React** 19.1.1 - Framework UI
- **Tailwind CSS** 4.1.16 - Estilos
- **React Router DOM** 6.28.0 - Navegación
- **Parcel** 2.16.1 - Bundler (zero-config)

## 📝 Notas

- El proyecto usa Tailwind CSS v4 con PostCSS
- Parcel maneja automáticamente el bundling sin necesidad de configuración extra
- Los estilos están en `src/index.css` y `tailwind.config.js`

\`\`\`

Ejecuta esto en PowerShell:

````powershell
cd 'C:\Users\Alonso Vera Sepúlved\farmalink'

# Actualizar [package.json](http://_vscodecontentref_/3)
npm install

# Verificar que todo funciona
npm run dev

"Mis compañeros solo necesitan":
git clone <repo>
npm install
npm run dev