import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'paid', 'pending'
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`http://localhost:2139/api/orders/user/${user._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setOrders(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
        console.error('Error fetching orders:', err);
      }
    };

    if (user?._id) {
      fetchOrders();
    }
  }, [user]);

  const paidOrders = orders.filter(order => order.isPaid);
  const notPaidOrders = orders.filter(order => !order.isPaid);
  
  const displayOrders = activeTab === 'all' 
    ? orders 
    : activeTab === 'paid' 
      ? paidOrders 
      : notPaidOrders;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-4 border-t-[#255F38] border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-[#27391C] font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg border border-red-100 max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
          <p className="mt-2 text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#18230F] mb-2">Your Order History</h1>
          <p className="text-gray-600">Track and manage all your purchases</p>
        </div>
        
        {/* Order Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#255F38]">
            <h3 className="text-lg font-semibold text-[#27391C] mb-1">Total Orders</h3>
            <p className="text-3xl font-bold text-[#18230F]">{orders.length}</p>
            <div className="mt-4 text-gray-500 text-sm">
              All time purchases
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#1F7D53]">
            <h3 className="text-lg font-semibold text-[#27391C] mb-1">Completed</h3>
            <p className="text-3xl font-bold text-[#255F38]">{paidOrders.length}</p>
            <div className="mt-4 text-gray-500 text-sm">
              Successfully paid orders
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-amber-500">
            <h3 className="text-lg font-semibold text-[#27391C] mb-1">Pending</h3>
            <p className="text-3xl font-bold text-amber-600">{notPaidOrders.length}</p>
            <div className="mt-4 text-gray-500 text-sm">
              Orders awaiting payment
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'all' 
                  ? 'text-[#255F38] border-b-2 border-[#255F38]' 
                  : 'text-gray-500 hover:text-[#27391C]'
              }`}
            >
              All Orders
            </button>
            <button 
              onClick={() => setActiveTab('paid')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'paid' 
                  ? 'text-[#255F38] border-b-2 border-[#255F38]' 
                  : 'text-gray-500 hover:text-[#27391C]'
              }`}
            >
              Completed
            </button>
            <button 
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'pending' 
                  ? 'text-[#255F38] border-b-2 border-[#255F38]' 
                  : 'text-gray-500 hover:text-[#27391C]'
              }`}
            >
              Pending
            </button>
          </div>
        </div>
        
        {/* Orders List */}
        <div className="space-y-6">
          {displayOrders.length > 0 ? (
            displayOrders.map(order => (
              <div 
                key={order._id} 
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${
                  order.isPaid 
                    ? 'border-l-4 border-[#1F7D53]' 
                    : 'border-l-4 border-amber-500'
                }`}
              >
                <div className="md:flex">
                  <div className="p-6 md:w-3/4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Order ID</p>
                        <p className="font-mono text-sm">{order._id}</p>
                      </div>
                      <div className={`${
                        order.isPaid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                        } px-3 py-1 rounded-full text-xs font-medium`}>
                        {order.isPaid ? 'Paid' : 'Payment Pending'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Amount</p>
                        <p className={`text-lg font-bold ${
                          order.isPaid ? 'text-[#1F7D53]' : 'text-amber-600'
                        }`}>
                          Rs. {order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      
                      {order.isPaid ? (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Payment Date</p>
                          <p className="font-medium">{formatDate(order.paidAt)}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Created On</p>
                          <p className="font-medium">{formatDate(order.createdAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`md:w-1/4 flex items-center justify-center p-6 ${
                    order.isPaid 
                      ? 'bg-gradient-to-br from-[#255F38]/10 to-[#1F7D53]/5' 
                      : 'bg-gradient-to-br from-amber-500/10 to-amber-600/5'
                  }`}>
                    {order.isPaid ? (
                      <button 
                        onClick={() => window.location.href = `/order/${order._id}`}
                        className="w-full px-4 py-2 bg-[#255F38] text-white rounded-lg hover:bg-[#18230F] transition-colors"
                      >
                        View Details
                      </button>
                    ) : (
                      <button 
                        onClick={() => window.location.href = `/placeorder`}
                        className="w-full px-4 py-2 bg-[#1F7D53] text-white rounded-lg hover:bg-[#18230F] transition-colors"
                      >
                        Complete Payment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-xl font-semibold text-[#27391C] mb-2">No orders found</h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'all' 
                  ? "You haven't placed any orders yet." 
                  : activeTab === 'paid' 
                    ? "You don't have any completed orders." 
                    : "You don't have any pending orders."}
              </p>
              <button 
                onClick={() => window.location.href = '/shop'}
                className="px-6 py-2 bg-[#255F38] text-white rounded-lg hover:bg-[#18230F] transition-colors"
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;