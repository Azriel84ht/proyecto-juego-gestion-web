import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-page-container">
      {isAuthenticated ? (
        <div className="dashboard">
          <h1>Bienvenido de nuevo, {user.username}</h1>
        </div>
      ) : (
        <div className="landing-page">
          <div className="content-box">
            <img src="/logo.png" alt="Logo" className="logo" />
            <h1>Bienvenido al Abismo</h1>
            <p>
              Forja tu imperio en las sombras. Domina a tus rivales y desvela
              los secretos que aguardan en la oscuridad.
            </p>
            <div className="button-container">
              <Link to="/login" className="btn btn-primary">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
