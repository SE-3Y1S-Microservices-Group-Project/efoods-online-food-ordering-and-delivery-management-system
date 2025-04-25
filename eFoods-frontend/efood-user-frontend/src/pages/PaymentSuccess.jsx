import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import axios from 'axios';

const PaymentSuccess = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const sessionId = query.get('session_id');

  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (sessionId) {
        try {
          const res = await axios.get(`http://localhost:5003/api/payment/session/${sessionId}`);
          setPaymentDetails(res.data);
        } catch (error) {
          console.error("Failed to fetch payment session:", error);
        }
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  const generatePDF = () => {
    if (!paymentDetails) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('E-Foods Payment Receipt', 20, 20);

    doc.setFontSize(12);
    doc.text(`Session ID: ${sessionId}`, 20, 35);
    doc.text(`Customer: ${paymentDetails.customerName}`, 20, 45);
    doc.text(`Email: ${paymentDetails.customerEmail}`, 20, 55);
    doc.text(`Amount Paid: Rs. ${paymentDetails.amount / 100}`, 20, 65);
    doc.text(`Payment Status: ${paymentDetails.status}`, 20, 75);
    doc.text(`Date: ${new Date(paymentDetails.created * 1000).toLocaleString()}`, 20, 85);

    doc.save(`efoods-receipt-${sessionId}.pdf`);
  };

  return (
    <div className="text-center mt-20">
      <h1 className="text-green-600 text-3xl font-bold">Payment Successful!</h1>
      <p>Your order has been confirmed. Thank you for ordering with e-foods.</p>

      {paymentDetails && (
        <button
          onClick={generatePDF}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download Receipt (PDF)
        </button>
      )}
    </div>
  );
};

export default PaymentSuccess;
