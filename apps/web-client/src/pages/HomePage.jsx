import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Bienvenido al Juego</h1>
        <p>Tu aventura espacial te espera</p>
      </header>
      <main className="home-main">
        <div className="cta-container">
          <Link to="/register" className="cta-button">
            ¡Regístrate Ahora!
          </Link>
          <p>
            ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>
          </p>
        </div>
      </main>
      <footer className="home-footer">
        <p>&copy; 2024 Tu Juego Espacial. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default HomePage;
