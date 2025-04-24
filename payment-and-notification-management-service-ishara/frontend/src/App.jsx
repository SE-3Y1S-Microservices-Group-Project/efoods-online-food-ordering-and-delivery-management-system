import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const CheckoutWrapper = () => {
  const { userId } = useParams();
  return <Checkout userId={userId} />;
};

const App = () => {
  return (
    <Elements stripe={stripePromise}>
      <Routes>
        <Route path="/checkout/:userId" element={<CheckoutWrapper />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
      </Routes>
    </Elements>
  );
};

export default App;
