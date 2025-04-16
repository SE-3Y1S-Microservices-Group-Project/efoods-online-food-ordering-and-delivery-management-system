import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/SideBar';
import axios from 'axios';
import { Pencil, Trash, Mail, Phone, MapPin, Info, Store, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Restaurant() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  const fetchMyRestaurant = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/restaurants/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRestaurant(res.data);

    } catch (err) {
      console.error('Error fetching restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your restaurant?')) {
      try {
        await axios.delete(`http://localhost:5000/api/restaurants/${restaurant._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Restaurant deleted successfully');
        localStorage.removeItem('token');
        navigate('/');
      } catch (err) {
        console.error(err);
        alert('Error deleting restaurant');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/restaurant/edit/${restaurant._id}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-4xl font-bold text-sky-700 mb-6">My Restaurant Profile</h1>

        {loading ? (
          <p>Loading...</p>
        ) : restaurant ? (
          <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-green-700 flex items-center">
                <Store className="mr-2" /> {restaurant.name}
              </h2>
              <div className="space-x-2">
                <button onClick={handleEdit} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center">
                  <Pencil className="w-4 h-4 mr-1" /> Edit
                </button>
                <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center">
                  <Trash className="w-4 h-4 mr-1" /> Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Detail icon={<Mail />} label="Email" value={restaurant.email} />
              <Detail icon={<Phone />} label="Contact" value={restaurant.contact} />
              <Detail icon={<MapPin />} label="Address" value={restaurant.address} />
              <Detail icon={<Info />} label="Status" value={restaurant.status} />
              <Detail icon={<Coins />} label="Delivery Fee" value={`LKR ${restaurant.deliveryFee}`} />
              <Detail icon={<Info />} label="Availability" value={restaurant.isAvailable ? 'Available' : 'Not Available'} />
            </div>

            {restaurant.description && (
              <div className="mt-6">
                <h3 className="font-semibold mb-1 text-gray-700">Description</h3>
                <p className="text-gray-600">{restaurant.description}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-500">No restaurant data found.</p>
        )}
      </div>
    </div>
  );
}

const Detail = ({ icon, label, value }) => (
  <div className="flex items-start border p-3 rounded shadow-sm bg-gray-50">
    <div className="text-gray-500 mr-3 mt-1">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-base font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);
