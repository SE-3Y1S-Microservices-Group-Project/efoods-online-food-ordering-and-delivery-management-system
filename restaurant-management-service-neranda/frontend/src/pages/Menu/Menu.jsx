import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/SideBar';
import axios from 'axios';
import MenuForm from './MenuForm';
import { useNavigate } from 'react-router-dom';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/menu');
      setMenuItems(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching menu items:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-sky-700">Menu Items</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900"
          >
            Add New Menu
          </button>
        </div>

        {showForm && (
          <MenuForm
            onClose={() => setShowForm(false)}
            onSuccess={(newMenuItem) => {
              fetchMenuItems();
              navigate(`/menu/${newMenuItem._id}`);
            }}
            restaurantId={"your-restaurant-id"} // Provide actual ID here
          />
        )}

        {loading ? (
          <p className="text-center text-gray-500">Loading menu items...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {menuItems.map(item => (
              <div key={item._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]} // show first image
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h2>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <p className="text-gray-700 font-bold mb-2">${item.price.toFixed(2)}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
