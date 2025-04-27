import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/SideBar';
import axios from 'axios';
import { Pencil, Trash, Mail, Phone, MapPin, Info, Store, Coins, Calendar, Clock, Award, Image } from 'lucide-react';
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

  const handleToggleAvailability = async () => {
    try {
      const updated = await axios.put(
        `http://localhost:5000/api/restaurants/${restaurant._id}/availability`,
        { isAvailable: !restaurant.isAvailable },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
  
      setRestaurant(updated.data); // update frontend view
    } catch (err) {
      console.error('Error updating availability:', err);
      alert('Failed to update availability status');
    }
  };
  

  const handleEdit = () => {
    navigate(`/restaurant/edit/${restaurant._id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-6 flex justify-center items-center">
          <div className="animate-pulse text-center">
            <div className="h-16 w-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 w-32 mx-auto rounded mb-2"></div>
            <div className="h-3 bg-gray-300 w-24 mx-auto rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-6 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-2">Restaurant Not Found</h2>
            <p className="text-gray-600">No restaurant data available.</p>
            <button
              onClick={() => navigate('/restaurant/create')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Create Restaurant
            </button>
          </div>
        </div>
      </div>
    );
  }

  const restaurantImage = restaurant.image?.[0] || 'https://via.placeholder.com/600x300?text=Restaurant+Image';

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-green-700">🍽️ My Restaurant</h1>
            {/* <div className="space-x-2">
              <button
                onClick={handleEdit}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow flex items-center"
              >
                <Pencil className="w-4 h-4 mr-2" /> 
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow flex items-center"
              >
                <Trash className="w-4 h-4 mr-2" /> 
              </button>
            </div> */}
          </div>

          {/* Hero Image */}
          <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden shadow-lg">
            <img
              src={restaurantImage}
              alt="Restaurant"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center px-10">
              <h2 className="text-3xl md:text-4xl text-white font-bold flex items-center">
                <Store className="mr-3" /> {restaurant.name} &nbsp;&nbsp;&nbsp;


                  <button
                    onClick={handleEdit}
                    className="text-white px-4 py-2 rounded shadow flex items-center hover:bg-green-600"
                  >
                    <Pencil className="w-4 h-4 mr-2" /> 
                  </button>

                  <button
                    onClick={handleDelete}
                    className="text-white px-4 py-2 rounded shadow flex items-center hover:bg-red-600"
                  >
                    <Trash className="w-4 h-4 mr-2" /> 
                  </button>

              </h2>
              <p className="flex items-center mt-2 text-white">
                <MapPin className="w-4 h-4 mr-1" /> {restaurant.address}
              </p>

              
              {/* <span className={`mt-4 inline-block px-3 py-1 rounded-full text-sm font-medium ${restaurant.isAvailable ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {restaurant.isAvailable ? 'Open Now' : 'Closed'}
              </span> */}

              <button
                onClick={handleToggleAvailability}
                className={`mt-4 inline-block px-4 py-3 rounded-full text-sm font-semibold transition duration-200 ${
                  restaurant.isAvailable
                    ? 'bg-green-300 text-green-800 hover:bg-green-500'
                    : 'bg-red-200 text-red-800 hover:bg-red-400'
                }`}
              >
                {restaurant.isAvailable ? '🔓 Open Now (Click to Close)' : '🔒 Closed (Click to Open)'}
              </button>

            </div>
          </div>

          {/* Detail Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <DetailSection icon={<Info />} title="About">
                <p className="text-gray-700">{restaurant.description || 'No description provided.'}</p>
              </DetailSection>

              <DetailSection title="Details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailCard icon={<Mail />} label="Email" value={restaurant.email} className="hover:bg-gray-100 hover:text-gray-900 hover:shadow transition duration-200 ease-in-out"/>
                  <DetailCard icon={<Phone />} label="Contact" value={restaurant.contact} className="hover:bg-gray-100 hover:text-gray-900 hover:shadow transition duration-200 ease-in-out"/>
                  <DetailCard icon={<Coins />} label="Delivery Fee" value={`USD ${restaurant.deliveryFee}`} className="hover:bg-gray-100 hover:text-gray-900 hover:shadow transition duration-200 ease-in-out"/>
                  <DetailCard icon={<Store />} label="Status" value={restaurant.status} className="hover:bg-gray-100 hover:text-gray-900 hover:shadow transition duration-200 ease-in-out"/>
                </div>
              </DetailSection>
            </div>

            {/* Sidebar Summary */}
            <div className="bg-white rounded-lg p-5 shadow-md">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Award className="mr-2" /> Quick Info
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
              <InfoItem 
                icon={<Calendar />} 
                label="Joined" 
                value={new Date(restaurant.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
/>
                <InfoItem icon={<Clock />} label="Hours" value={restaurant.openingTime + ' - ' + restaurant.closingTime} />
                <InfoItem icon={<Award />} label="Specialty" value="Authentic Sri Lankan Cuisine" />
                
              </div>
              
            </div>

            <div className='bg-green-100 rounded-lg p-5 shadow-md border items-center text-center'>
              <h2 className="text-2xl font-bold mb-4">Revenue Section</h2>

                <div>
                  {/* <RevenueTable /> */}
                </div>

            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

const DetailSection = ({ title, icon, children }) => (
  <div>
    <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-3">
      {icon && <span className="mr-2 text-blue-600">{icon}</span>}
      {title}
    </h3>
    <div className="bg-white p-4 rounded-lg shadow-sm">{children}</div>
  </div>
);

const DetailCard = ({ icon, label, value }) => (
  <div className="flex items-center bg-gray-50 p-4 rounded-lg border hover:shadow transition duration-200">
    <div className="text-green-600 mr-3">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center">
    <div className="text-blue-500 mr-3">{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  </div>
);
