import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";

const CheckoutWrapper = () => {
  const { userId } = useParams();
  return <Checkout userId={userId} />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/checkout/:userId" element={<CheckoutWrapper />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
    </Routes>
  );
};

export default App;
