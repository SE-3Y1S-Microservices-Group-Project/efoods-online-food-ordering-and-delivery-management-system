import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState(null); // Get from AuthContext in real

  const fetchCart = async () => {
    try {
      if (!user?._id) return;
      const res = await API.get(`/cart/${user._id}`); // updated to use user._id
      setCart(res.data.items);
    } catch (err) {
      console.error("Fetch cart error:", err);
    }
  };
  
  const addToCart = async (item) => {
    try {
      await API.post('/cart', item); // corrected endpoint
      fetchCart();
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };  

  return (
    <CartContext.Provider value={{ cart, fetchCart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);