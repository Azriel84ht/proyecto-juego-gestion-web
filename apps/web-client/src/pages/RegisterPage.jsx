import React, { useState } from 'react';
import axios from 'axios';
import './AuthPages.css';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const { data } = await axios.post('/api/auth/register', {
        username,
        email,
        password,
      });
      setMessage({ type: 'success', text: data.message });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error en el registro',
      });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Crear Cuenta</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Registrarse</button>
          {message && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;