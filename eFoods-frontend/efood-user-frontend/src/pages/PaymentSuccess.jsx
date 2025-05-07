import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import axios from 'axios';

const PaymentSuccess = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const sessionId = query.get('session_id');

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notificationStatus, setNotificationStatus] = useState({ email: '', sms: '' });

  // Generate EF + 13 digit reference number
  const generateReferenceNumber = () => {
    const numbers = sessionId.replace(/\D/g, '');
    if (numbers.length >= 13) {
      return `EF${numbers.substring(0, 13)}`;
    }
    const padding = '0123456789'.repeat(2);
    const paddedNumbers = (numbers + padding).substring(0, 13);
    return `EF${paddedNumbers}`;
  };

  useEffect(() => {
    if (sessionId) {
      setReferenceNumber(generateReferenceNumber());
    }
  }, [sessionId]);

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
    if (!paymentDetails || !referenceNumber) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Receipt', 105, 20, { align: 'center' });

    doc.setDrawColor(92, 179, 56);
    doc.setLineWidth(0.5);
    doc.line(15, 25, 195, 25);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    doc.text('Customer Information:', 15, 35);
    doc.text(`Name: ${paymentDetails.customerName}`, 15, 45);
    doc.text(`Email: ${paymentDetails.customerEmail}`, 15, 55);

    doc.text('Transaction Details:', 15, 70);
    doc.text(`Reference ID: ${referenceNumber}`, 15, 80);
    doc.text(`Amount: US$. ${paymentDetails.amount / 100}`, 15, 90);
    doc.text(`Status: ${paymentDetails.status}`, 15, 100);
    doc.text(`Date: ${new Date(paymentDetails.created * 1000).toLocaleString()}`, 15, 110);

    doc.setFontSize(14);
    doc.setTextColor(92, 179, 56);
    doc.text('Thank you for your order!', 105, 130, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('For any inquiries, please contact support@efoods.com', 105, 140, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('© 2023 eFoods - All Rights Reserved', 105, 285, { align: 'center' });

    doc.save(`efoods-receipt-${referenceNumber}.pdf`);
  };

  const sendEmail = async () => {
    console.log("Sending email to:", paymentDetails?.customerEmail);
    try {
      const res = await axios.post('http://localhost:5003/api/notify/send-email', {
        toEmail: paymentDetails.customerEmail,
        orderId: paymentDetails.orderId || referenceNumber
      });
      setNotificationStatus(prev => ({ ...prev, email: 'Email sent successfully!' }));
    } catch (error) {
      console.error('Error sending email:', error);
      setNotificationStatus(prev => ({ ...prev, email: 'Email sending failed.' }));
    }
  };
  
  

  const sendSMS = async () => {
    try {
      const res = await axios.post('http://localhost:5003/api/notify/send-sms', {
        orderId: paymentDetails.orderId || referenceNumber
      });
      setNotificationStatus(prev => ({ ...prev, sms: 'SMS sent successfully!' }));
    } catch (error) {
      console.error('Error sending SMS:', error);
      setNotificationStatus(prev => ({ ...prev, sms: 'SMS sending failed.' }));
    }
  };

  return (
    <div className="min-h-screen bg-[#255F38] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">

        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#255F38] mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[#255F38] mb-3">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Your order has been confirmed. Thank you for ordering with e-foods.</p>

        <div className="flex justify-center space-x-1 mb-6">
          {['#255F38', '#1F7D53', '#FFC145', '#1F7D53', '#255F38'].map((color, i) => (
            <div key={i} className="w-2 h-8 rounded-full" style={{ backgroundColor: color }}></div>
          ))}
        </div>

        {paymentDetails && referenceNumber && (
          <div className="bg-[#F8F9FA] p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold text-[#255F38] mb-2">Order Summary</h3>
            <p className="text-sm"><span className="font-medium">Reference:</span> {referenceNumber}</p>
            <p className="text-sm"><span className="font-medium">Amount:</span> US$. {paymentDetails.amount / 100}</p>
            <p className="text-sm"><span className="font-medium">Status:</span> <span className="text-[#1F7D53] font-bold">{paymentDetails.status}</span></p>
          </div>
        )}

        {paymentDetails && referenceNumber && (
          <>
            <button
              onClick={generatePDF}
              className="w-full bg-gradient-to-r from-[#1F7D53] to-[#FFC145] text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download Receipt
            </button>

            <button
              onClick={sendEmail}
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg mb-2 hover:bg-blue-700 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.94 6.34l6.39 3.85a1.5 1.5 0 001.44 0l6.39-3.85A1.5 1.5 0 0016.5 5h-13a1.5 1.5 0 00-.56 1.34z" />
                <path d="M18 8.1l-6.77 4.08a3.5 3.5 0 01-3.46 0L2 8.1V14a1 1 0 001 1h14a1 1 0 001-1V8.1z" />
              </svg>
              Email Confirmation
            </button>

            <button
              onClick={sendSMS}
              className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg mb-2 hover:bg-green-700 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H7l-5 4V5zm3 3a1 1 0 100-2 1 1 0 000 2zm3-1a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              SMS Confirmation
            </button>


            {/* Display feedback */}
            {(notificationStatus.email || notificationStatus.sms) && (
              <div className="mt-3 text-sm text-gray-700">
                {notificationStatus.email && <p>{notificationStatus.email}</p>}
                {notificationStatus.sms && <p>{notificationStatus.sms}</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
