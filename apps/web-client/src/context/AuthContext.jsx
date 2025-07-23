import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const decoded = jwtDecode(token);
      setUser(decoded);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    if (data.twoFactorEnabled) {
      return data;
    }
    localStorage.setItem('token', data.accessToken);
    setToken(data.accessToken);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
