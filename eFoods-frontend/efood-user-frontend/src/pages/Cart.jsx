import { useCart } from '../context/CartContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- import this

const Cart = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate(); // <-- hook

  useEffect(() => {
    fetchCart();
  }, []);

  const goToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#ECE852] p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-center text-[#5CB338] mb-6">Your Cart</h2>
        {cart.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No items yet.</p>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-[#FFC145] text-white px-4 py-3 rounded-lg shadow-md"
                >
                  <p className="text-lg font-medium">{item.menuItem?.name}</p>
                  <span className="bg-[#FB4141] px-3 py-1 rounded-full text-sm font-semibold">
                    Qty: {item.quantity}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={goToCheckout}
                className="px-6 py-3 bg-[#5CB338] text-white rounded-lg font-semibold hover:bg-green-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;