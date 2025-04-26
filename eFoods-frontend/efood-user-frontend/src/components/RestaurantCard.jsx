import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RestaurantCard({ restaurant }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="bg-white border rounded-xl shadow-md hover:shadow-xl cursor-pointer transition duration-300"
      >
        <img
          src={restaurant.image?.[0] ? `http://localhost:5000${restaurant.image[0]}` : 'https://via.placeholder.com/400'}
          alt={restaurant.name}
          className="w-full h-44 object-cover rounded-t-xl"
        />

        <div className="p-4">
          <h3 className="text-lg font-bold text-primaryGreen">{restaurant.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-1">{restaurant.address}</p>

          <div className="text-right">
            <Link to={`/restaurants/${restaurant._id}`}>
              <button className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-1 rounded">
                View Menu →
              </button>
            </Link>
        </div>

        </div>

      </div>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg relative animate-fadeIn"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              ✖
            </button>
              <img
                src={restaurant.image?.[0] ? `http://localhost:5000${restaurant.image[0]}` : 'https://via.placeholder.com/400'}
                className="rounded mb-4"
              />
            <h2 className="text-xl font-bold text-primaryGreen">{restaurant.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{restaurant.description || 'No description provided.'}</p>
            <p className="text-sm text-gray-600 mt-2"><strong>Address:</strong> {restaurant.address}</p>
          </div>
        </div>
      )}
    </>
  );
}
