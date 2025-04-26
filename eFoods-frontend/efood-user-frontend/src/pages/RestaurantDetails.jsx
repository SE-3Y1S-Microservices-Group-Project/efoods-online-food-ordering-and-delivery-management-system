import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Eye } from 'lucide-react';

export default function RestaurantDetails() {
  const { id } = useParams();
  const [menu, setMenu] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/menu?restaurantId=${id}`)
      .then(res => setMenu(res.data));
  }, [id]);

  return (
    <div className="bg-gradient-to-br from-green-200 to-green-50 min-h-screen py-10 px-6 max-w-8xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-primaryGreen">🍲 Menu Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {menu.map(item => (
          <div
            key={item._id}
            onClick={() => setSelected(item)}
            className="bg-white border rounded-lg shadow hover:shadow-lg transition cursor-pointer"
          >
            <img src={item.image?.[0] || 'https://via.placeholder.com/300'} className="w-full h-44 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
              <p className="text-sky-700 font-bold mt-2">Rs. {item.finalPrice}</p>
              <button className="mt-2 bg-primaryGreen text-white px-4 py-1 rounded hover:bg-green-700 text-sm">
                Order Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg relative animate-fadeIn"
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              ✖
            </button>
            <img src={selected.image?.[0] || 'https://via.placeholder.com/400'} className="rounded mb-4" />
            <h2 className="text-xl font-bold text-primaryGreen">{selected.name}</h2>
            <p className="text-sm mt-2 text-gray-600">{selected.description}</p>
            <div className="mt-3 text-sm text-gray-600">
              <p><strong>Price:</strong> Rs. {selected.finalPrice}</p>
              <p><strong>Prep Time:</strong> {selected.prepTime} min</p>
              <p><strong>Stock:</strong> {selected.stock}</p>
              <p><strong>Ingredients:</strong> {selected.ingredients?.join(', ')}</p>
              <p><strong>Tags:</strong> {selected.tags?.join(', ')}</p>
            </div>
            <button className="mt-4 w-full bg-primaryGreen text-white px-4 py-2 rounded hover:bg-green-700">Add to Cart</button>
          </div>
        </div>
      )}
    </div>
  );
}
