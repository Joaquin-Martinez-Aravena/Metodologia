// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Usaremos react-router-dom para redirigir

function Login({ setUserRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Función para manejar el inicio de sesión
  const handleLogin = (e) => {
    e.preventDefault();
    // Verificar las credenciales
    if (email === "Administrador@gmail.com" && password === "adm123") {
      setUserRole("admin");
      navigate("/dashboard"); // Redirigir a la sección de administración
    } else if (email === "Empleado@gmail.com" && password === "empleado123") {
      setUserRole("employee");
      navigate("/dashboard"); // Redirigir a la sección de empleado
    } else {
      setError("Credenciales incorrectas.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-96 p-8 border rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Iniciar sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-center mt-6">
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-md">
              Iniciar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
