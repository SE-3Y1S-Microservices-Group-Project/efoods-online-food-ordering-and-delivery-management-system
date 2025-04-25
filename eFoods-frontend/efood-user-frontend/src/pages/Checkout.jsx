import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!address || !city || !postalCode || !country) {
      return alert('Please fill all shipping fields');
    }
    setLoading(true);
    try {
      const orderData = {
        userId: user._id,
        shippingInfo: {
          address,
          city,
          postalCode,
          country,
        },
      };
      

      const res = await API.post('/orders', orderData); // ✅ get response
      const orderId = res.data._id; // ✅ get orderId
      alert('Order placed successfully!');
      fetchCart();

      navigate('/placeorder', {
       state: { orderId }, // ✅ pass it properly
      });


    } catch (err) {
      console.error(err);
      alert('Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce(
    (acc, item) => acc + item.menuItem.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-[#ECE852] py-10 px-4">
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-[#5CB338] mb-6 text-center">Checkout</h2>
        
        <div className="space-y-4">
          {cart.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-[#FFC145] text-white px-4 py-3 rounded-lg shadow"
            >
              <div>
                <p className="font-semibold">{item.menuItem?.name}</p>
                <p className="text-sm">Qty: {item.quantity}</p>
              </div>
              <p className="text-lg font-bold">
                Rs. {(item.menuItem?.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-[#5CB338] mb-1">Address</label>
            <input
              type="text"
              className="w-full border-2 border-[#5CB338] p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#5CB338]"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street Address"
            />
          </div>
          <div>
            <label className="block font-medium text-[#5CB338] mb-1">City</label>
            <input
              type="text"
              className="w-full border-2 border-[#5CB338] p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#5CB338]"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
            />
          </div>
          <div>
            <label className="block font-medium text-[#5CB338] mb-1">Postal Code</label>
            <input
              type="text"
              className="w-full border-2 border-[#5CB338] p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#5CB338]"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Postal Code"
            />
          </div>
          <div>
            <label className="block font-medium text-[#5CB338] mb-1">Country</label>
            <input
              type="text"
              className="w-full border-2 border-[#5CB338] p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#5CB338]"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <p className="text-xl font-bold text-[#FB4141]">
            Total: Rs. {total.toFixed(2)}
          </p>
          <button
            onClick={handleCheckout}
            className={`px-6 py-3 rounded font-semibold transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#5CB338] text-white hover:bg-green-700'
            }`}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;