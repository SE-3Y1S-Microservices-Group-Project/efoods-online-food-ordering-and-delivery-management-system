import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

const Checkout = ({ userId }) => {
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newCard, setNewCard] = useState({
    cardHolderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5003/api/payment/checkout/${userId}`
        );
        setCheckoutData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching checkout data:", err);
        setLoading(false);
      }
    };

    fetchCheckoutData();
  }, [userId]);

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setNewCard((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCardSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5003/api/payment/card", {
        userId,
        ...newCard,
      });

      setCheckoutData((prev) => ({
        ...prev,
        savedCards: [...prev.savedCards, res.data.card],
      }));

      setNewCard({
        cardHolderName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding card:", err);
    }
  };

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleDeleteCard = (card) => {
    setCardToDelete(card);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!cardToDelete) return;

    try {
      await axios.delete(
        `http://localhost:5003/api/payment/saved-cards/${cardToDelete._id}`,
        {
          data: { userId },
        }
      );

      setCheckoutData((prev) => ({
        ...prev,
        savedCards: prev.savedCards.filter(
          (card) => card._id !== cardToDelete._id
        ),
      }));

      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Error deleting card:", err);
    }
  };

  const handlePayment = async (orderId) => {
    try {
      const response = await axios.post(
        "http://localhost:5003/api/payment/process",
        {
          userId,
          orderId,
          cardId: selectedCardId || undefined,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const paymentWindow = window.open("", "_blank");
      paymentWindow.document.write(response.data);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    }
  };

  if (loading) return <p>Loading checkout info...</p>;
  if (!checkoutData) return <p>No data available</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>

      {/* Customer Info */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-2">Customer Information</h3>
        <p>
          {checkoutData.customer.firstName} {checkoutData.customer.lastName}
        </p>
        <p>Email: {checkoutData.customer.email}</p>
        <p>Phone: {checkoutData.customer.contact}</p>
      </div>

      {/* Shipping Info */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-2">Shipping Information</h3>
        <p>Address: {checkoutData.order.shippingInfo.address}</p>
        <p>City: {checkoutData.order.shippingInfo.city}</p>
        <p>
          Postal Code: {checkoutData.order.shippingInfo.postalCode || "N/A"}
        </p>
        <p>Country: {checkoutData.order.shippingInfo.country}</p>
      </div>

      {/* Order Summary */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-2">Order Summary</h3>
        <ul className="divide-y">
          {checkoutData.order.items.map((item, idx) => (
            <li key={idx} className="py-2">
              <div className="flex justify-between">
                <span>
                  <strong>{item.menuItemName}</strong> (x{item.quantity})
                </span>
                <span>Rs. {item.price * item.quantity}</span>
              </div>
              <p className="text-sm text-gray-600">
                {item.restaurantName}
              </p>
            </li>
          ))}
        </ul>
        <div className="border-t pt-2 mt-2">
          <p className="font-bold text-lg flex justify-between">
            <span>Total:</span>
            <span>Rs. {checkoutData.order.totalAmount}</span>
          </p>
        </div>
      </div>

      {/* Saved Cards */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">Payment Method</h3>
          <button
            onClick={toggleModal}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add New Card
          </button>
        </div>

        {checkoutData.savedCards.length ? (
          checkoutData.savedCards.map((card, index) => (
            <div
              key={index}
              className={`mb-2 p-3 border rounded flex items-center justify-between ${
                selectedCardId === card._id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() => setSelectedCardId(card._id)}
            >
              <div>
                <p>
                  <strong>{card.cardHolderName}</strong>
                </p>
                <p>{card.cardNumber.replace(/.(?=.{4})/g, "*")}</p>
                <p>Expires: {card.expiryDate}</p>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={selectedCardId === card._id}
                  onChange={() => setSelectedCardId(card._id)}
                  className="mr-2"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCard(card);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No saved cards</p>
        )}
      </div>

      {/* Pay Button */}
      <div className="mt-6">
        <button
          onClick={() => handlePayment(checkoutData.order._id)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg w-full"
        >
          Pay Now (Rs. {checkoutData.order.totalAmount})
        </button>
      </div>

      {/* Add New Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md w-96">
            <h3 className="text-xl font-semibold mb-4">Add New Card</h3>
            <form onSubmit={handleAddCardSubmit}>
              <label className="block mb-1 text-sm font-medium">
                Cardholder Name
              </label>
              <input
                type="text"
                name="cardHolderName"
                value={newCard.cardHolderName}
                onChange={handleCardInputChange}
                placeholder="John Doe"
                className="mb-3 p-2 w-full border rounded"
                required
              />

              <label className="block mb-1 text-sm font-medium">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={newCard.cardNumber}
                onChange={handleCardInputChange}
                placeholder="**** **** **** ****"
                className="mb-3 p-2 w-full border rounded"
                required
              />

              <div className="flex mb-3">
                <div className="w-1/2 pr-2">
                  <label className="block mb-1 text-sm font-medium">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={newCard.expiryDate}
                    onChange={handleCardInputChange}
                    placeholder="MM/YY"
                    className="p-2 w-full border rounded"
                    required
                  />
                </div>
                <div className="w-1/2 pl-2">
                  <label className="block mb-1 text-sm font-medium">CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={newCard.cvv}
                    onChange={handleCardInputChange}
                    placeholder="123"
                    className="p-2 w-full border rounded"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white p-2 mt-2 w-full rounded"
              >
                Add Card
              </button>
            </form>
            <button
              onClick={toggleModal}
              className="mt-4 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md w-96">
            <h3 className="text-xl font-semibold mb-4">
              Remove this card?
            </h3>
            {cardToDelete && (
              <div className="mb-4">
                <p>
                  <strong>Card Holder:</strong> {cardToDelete.cardHolderName}
                </p>
                <p>
                  <strong>Card Number:</strong>{" "}
                  {cardToDelete.cardNumber.replace(/.(?=.{4})/g, "*")}
                </p>
                <p>
                  <strong>Expires:</strong> {cardToDelete.expiryDate}
                </p>
              </div>
            )}
            <div className="flex justify-between">
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 text-white p-2 px-4 rounded"
              >
                Remove
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-300 text-gray-800 p-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;