import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProfilePage from './pages/ProfilePage';
import AccountPage from './pages/AccountPage';
import LoginHistoryPage from './pages/LoginHistoryPage';
import TwoFactorAuthPage from './pages/TwoFactorAuthPage';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/2fa" element={<TwoFactorAuthPage />} />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/account"
        element={
          <PrivateRoute>
            <AccountPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/login-history"
        element={
          <PrivateRoute>
            <LoginHistoryPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;