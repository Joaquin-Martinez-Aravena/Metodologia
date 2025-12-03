// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setUserRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "Administrador@gmail.com" && password === "adm123") {
      setUserRole("admin");
      navigate("/dashboard");
    } else if (email === "Empleado@gmail.com" && password === "empleado123") {
      setUserRole("employee");
      navigate("/dashboard");
    } else {
      setError("Credenciales incorrectas.");
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <h2 className="login-title">Iniciar sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="login-form-group">
            <label className="login-label">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>
          <div className="login-form-group">
            <label className="login-label">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <div className="login-button-row">
            <button type="submit" className="login-button">
              Iniciar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
