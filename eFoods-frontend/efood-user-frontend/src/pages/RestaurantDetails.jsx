import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // ✅ Step 1: Import useAuth
import axios from 'axios';

export default function RestaurantDetails() {
  const { id: restaurantId } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth(); // ✅ Step 2: Get user from auth context
  const userId = user?._id; // ✅ Optional: Access user ID

  const [menu, setMenu] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showActionModal, setShowActionModal] = useState(false);


  useEffect(() => {
    axios.get(`http://localhost:5000/api/menu?restaurantId=${restaurantId}`)
      .then(res => setMenu(res.data));
  }, [restaurantId]);

  const handleAddToCart = () => {
    if (!selected || quantity < 1 || !restaurantId || !user?._id) return;
  
    const item = {
      userId: user._id,
      restaurantId,
      menuItemId: selected._id,
      quantity,
    };
  
    addToCart(item); // assuming your context handles this correctly
    alert('Item added to cart!');
    setShowActionModal(true);
    setSelected(null);
    setQuantity(1);
  };

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
            <img 
              src={item.image?.[0] ? `http://localhost:5000${item.image[0]}` : 'https://via.placeholder.com/300'} 
              className="w-full h-44 object-cover" 
              alt={item.name}
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
              <p className="text-sky-700 font-bold mt-2">Rs. {item.finalPrice}</p>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
        >
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              ✖
            </button>

            <img 
              src={selected.image?.[0] ? `http://localhost:5000${selected.image[0]}` : 'https://via.placeholder.com/400'} 
              className="rounded mb-4" 
              alt={selected.name}
            />
            
            <h2 className="text-xl font-bold text-primaryGreen">{selected.name}</h2>
            <p className="text-sm mt-2 text-gray-600">{selected.description}</p>
            <div className="mt-3 text-sm text-gray-600">
              <p><strong>Price:</strong> Rs. {selected.finalPrice}</p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <button
                className="bg-red-400 text-white px-3 py-1 rounded-full"
                onClick={() => setQuantity(prev => (prev > 1 ? prev - 1 : 1))}
              >-</button>
              <span className="font-bold text-lg">{quantity}</span>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded-full"
                onClick={() => setQuantity(prev => prev + 1)}
              >+</button>
            </div>
            <button
              onClick={handleAddToCart}
              className="mt-4 w-full bg-yellow-700 text-black px-4 py-2 rounded hover:bg-green-700"
            >
              Add {quantity} to Cart
            </button>
          </div>
        </div>
      )},
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full text-center space-y-4">
            <h3 className="text-xl font-bold text-green-700">Item Added to Cart!</h3>
            <p className="text-gray-600">What would you like to do next?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.location.href = '/cart'}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                🛒 Go to Cart
              </button>
              <button
                onClick={() => setShowActionModal(false)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              >
                ➕ Add Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}