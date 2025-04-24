import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { RestaurantContext } from '../../context/RestaurantContext';

const ProtectedRestaurant = ({ children }) => {
  const { user } = useContext(RestaurantContext);
  return user ? children : <Navigate to="/register" />;
};

export default ProtectedRestaurant;