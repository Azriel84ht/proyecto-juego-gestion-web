import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

import './VerifyEmailPage.css';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Verificando tu cuenta...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No se ha proporcionado un token de verificación.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al verificar el token.');
        }

        setStatus('success');
        setMessage('¡Cuenta verificada con éxito! Ya puedes iniciar sesión.');
      } catch (error) {
        setStatus('error');
        setMessage(error.message);
      }
    };

    verifyToken();
  }, [searchParams]);

  const renderContent = () => {
    switch (status) {
      case 'success':
        return (
          <>
            <p className="message success">{message}</p>
            <Link to="/login" style={{ textDecoration: 'none', marginTop: '1rem' }}>
              <button>Ir a Iniciar Sesión</button>
            </Link>
          </>
        );
      case 'error':
        return <p className="message error">{message}</p>;
      case 'verifying':
      default:
        return <p className="message">{message}</p>;
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        <h2>Verificación de Cuenta</h2>
        {renderContent()}
      </div>
    </div>
  );
}

export default VerifyEmailPage;