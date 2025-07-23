import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './AuthPages.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const data = await login(email, password);
      if (data.twoFactorEnabled) {
        navigate('/2fa', { state: { userId: data.userId } });
      } else {
        navigate('/profile');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
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
          <button type="submit">Entrar</button>
          {message && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;