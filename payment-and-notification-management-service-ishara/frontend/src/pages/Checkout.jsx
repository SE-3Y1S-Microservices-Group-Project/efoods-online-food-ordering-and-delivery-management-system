import React from "react";
import axios from "axios";

const Checkout = () => {
  const handlePayment = async () => {
    try {
      const res = await axios.post("http://localhost:5003/api/payment/create", {
        userId: "cust123",
        orderId: "ORD456",
        amount: 1300,
        first_name: "Sasin",
        last_name: "Perera",
        email: "sasin@email.com",
        phone: "0771234567",
        address: "Colombo",
      });

      const { redirectURL, paymentData } = res.data;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = redirectURL;

      for (const key in paymentData) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Failed to start payment process.");
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Checkout Page</h1>
      <button
        onClick={handlePayment}
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Pay Now
      </button>
    </div>
  );
};

export default Checkout;
