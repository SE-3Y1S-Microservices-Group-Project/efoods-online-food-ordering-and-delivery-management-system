import { useEffect, useState } from 'react';
import axios from 'axios';
import RestaurantCard from '../components/RestaurantCard';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/restaurants')
      .then(res => setRestaurants(res.data));
  }, []);

  return (
    <div className="bg-gradient-to-br from-green-200 to-green-50 min-h-screen py-10 px-10 max-w-8xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-primaryGreen">Explore Restaurants 🍽️</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map(r => (
          <RestaurantCard key={r._id} restaurant={r} />
        ))}
      </div>
    </div>
  );
}
