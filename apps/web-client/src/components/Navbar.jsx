import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Tu Juego Espacial</Link>
      </div>
      <ul className="navbar-nav">
        {user ? (
          <>
            <li>
              <Link to="/profile">Perfil</Link>
            </li>
            <li>
              <button onClick={logout} className="logout-button">
                Cerrar Sesión
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Iniciar Sesión</Link>
            </li>
            <li>
              <Link to="/register">Registrarse</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
