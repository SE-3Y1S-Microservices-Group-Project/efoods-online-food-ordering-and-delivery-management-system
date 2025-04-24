// src/contexts/RestaurantContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import APIres from '../utils/apires';

const RestaurantContext = createContext();

export const useRestaurant = () => useContext(RestaurantContext);

export const RestaurantProvider = ({ children }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('restaurantToken') || '');

  useEffect(() => {
    if (token && !restaurant) {
        APIres.get('/api/restaurant/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setRestaurant(res.data))
      .catch(() => {
        logout();
      });
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await APIres.post('/api/restaurant/login', { email, password });
      setRestaurant(res.data.restaurant);
      setToken(res.data.token);
      localStorage.setItem('restaurantToken', res.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  };

  const logout = () => {
    setRestaurant(null);
    setToken('');
    localStorage.removeItem('restaurantToken');
  };

  return (
    <RestaurantContext.Provider value={{ restaurant, token, login, logout }}>
      {children}
    </RestaurantContext.Provider>
  );
};