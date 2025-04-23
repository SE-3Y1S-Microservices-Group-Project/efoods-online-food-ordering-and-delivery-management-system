import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActiveDeliveries = () => {
  const [orders, setOrders] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  // Fetch orders from the connected database
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get('http://localhost:5001/api/drivers/orders', { headers });
        console.log('API Response:', response.data); // Log the response for debugging
        
        // Check if data is in the expected format (with success, count, and data properties)
        let ordersData;
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          ordersData = response.data.data;
          console.log('Found orders data in response.data.data:', ordersData);
        } else if (Array.isArray(response.data)) {
          ordersData = response.data;
          console.log('Found orders data directly in response.data:', ordersData);
        } else {
          // For testing, create some dummy data when no orders are returned
          console.log('No orders found or unexpected format - creating test data');
          ordersData = [
            {
              _id: 'test123456',
              totalAmount: 25.99,
              items: [{ restaurantId: 'rest7890', quantity: 2 }],
              shippingInfo: {
                address: '123 Main St',
                city: 'Springfield',
                postalCode: '12345'
              }
            },
            {
              _id: 'test654321',
              totalAmount: 42.50,
              items: [{ restaurantId: 'rest4567', quantity: 3 }],
              shippingInfo: {
                address: '456 Oak Ave',
                city: 'Springfield',
                postalCode: '12345'
              }
            }
          ];
        }
        
        // Convert orders to delivery format - less restrictive mapping
        const newOrders = ordersData.map(order => {
          console.log('Processing order:', order); // Log each order for debugging
          return {
            _id: order._id || `order-${Math.random().toString(36).substr(2, 9)}`,
            orderNumber: order._id ? order._id.toString().slice(-6) : Math.floor(100000 + Math.random() * 900000).toString(),
            restaurantName: order.items && order.items.length > 0 
              ? `Restaurant ${order.items[0]?.restaurantId?.toString().slice(-4) || "Unknown"}`
              : "Restaurant Unknown",
            dropoffAddress: order.shippingInfo
              ? `${order.shippingInfo.address || ''}, ${order.shippingInfo.city || ''}, ${order.shippingInfo.postalCode || ''}`
              : "123 Sample St, Springfield, 12345", // Fallback for testing
            customerName: order.customerName || "Customer Name", 
            customerPhone: order.customerPhone || "123-456-7890", 
            estimatedEarnings: order.totalAmount ? (order.totalAmount * 0.15).toFixed(2) : "5.00",
            status: 'new',
            items: order.items || [{quantity: 1, name: "Test Item"}],
            totalAmount: order.totalAmount || 25.00
          };
        });
        
        console.log('Processed orders:', newOrders);
        
        // Less restrictive filtering - only filter out orders that are completely invalid
        const availableOrders = newOrders.filter(order => order._id);
        
        console.log('Available orders after filtering:', availableOrders);
        setOrders(availableOrders);
        
        // Get active deliveries from localStorage
        try {
          const storedDeliveries = localStorage.getItem('activeDeliveries');
          if (storedDeliveries) {
            const activeOrdersFromStorage = JSON.parse(storedDeliveries);
            console.log('Active deliveries from storage:', activeOrdersFromStorage);
            
            // Ensure the data is an array
            if (Array.isArray(activeOrdersFromStorage) && activeOrdersFromStorage.length > 0) {
              setActiveDeliveries(activeOrdersFromStorage);
            } else {
              console.log('No valid active deliveries in storage');
            }
          }
        } catch (storageErr) {
          console.error('Error reading from localStorage:', storageErr);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to fetch orders. Please check server connection.');
        
        // For testing purposes - create dummy data even when API fails
        const dummyOrders = [
          {
            _id: 'offline123',
            orderNumber: '654321',
            restaurantName: 'Restaurant Offline',
            dropoffAddress: '123 Test St, Springfield, 12345',
            customerName: 'Test Customer',
            customerPhone: '123-456-7890',
            estimatedEarnings: '5.25',
            status: 'new',
            items: [{quantity: 2, name: "Burger"}],
            totalAmount: 35.00
          }
        ];
        setOrders(dummyOrders);
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Set up interval to refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Save active deliveries to localStorage whenever they change
    if (activeDeliveries.length > 0) {
      try {
        localStorage.setItem('activeDeliveries', JSON.stringify(activeDeliveries));
        console.log('Saved active deliveries to localStorage:', activeDeliveries);
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
    }
  }, [activeDeliveries]);

  const updateDeliveryStatus = async (deliveryId, status) => {
    try {
      // Just update local state for now
      if (status === 'picked_up') {
        const updatedDeliveries = activeDeliveries.map(delivery => 
          delivery._id === deliveryId ? { ...delivery, status } : delivery
        );
        setActiveDeliveries(updatedDeliveries);
        
        // Update selected delivery if this is the one
        if (selectedDelivery && selectedDelivery._id === deliveryId) {
          setSelectedDelivery({ ...selectedDelivery, status });
        }
        
        toast(`Order marked as picked up!`);
      } else if (status === 'delivered') {
        // Remove from active list if delivered
        const updatedDeliveries = activeDeliveries.filter(delivery => delivery._id !== deliveryId);
        setActiveDeliveries(updatedDeliveries);
        
        // Also update localStorage to remove the delivery
        try {
          localStorage.setItem('activeDeliveries', JSON.stringify(updatedDeliveries));
        } catch (err) {
          console.error('Failed to update localStorage:', err);
        }
        
        // Clear selected delivery if this was the one
        if (selectedDelivery && selectedDelivery._id === deliveryId) {
          setSelectedDelivery(null);
        }
        
        toast(`Order delivered successfully!`);
      }
    } catch (err) {
      setError(`Failed to update delivery status: ${err.message}`);
    }
  };

  const handleAcceptOrder = async (order) => {
    try {
      // For now, just update the UI without making an API call
      // In a real implementation, you would call your backend API to update the order status
      
      // Remove from orders list
      const updatedOrders = orders.filter(o => o._id !== order._id);
      setOrders(updatedOrders);
      
      // Add to active deliveries
      const newDelivery = {
        ...order,
        status: 'accepted'
      };
      
      const updatedDeliveries = [...activeDeliveries, newDelivery];
      setActiveDeliveries(updatedDeliveries);
      console.log('Order accepted:', newDelivery);
      
      // Update localStorage
      try {
        localStorage.setItem('activeDeliveries', JSON.stringify(updatedDeliveries));
      } catch (err) {
        console.error('Failed to update localStorage:', err);
      }
      
      // Display success notification
      toast(`Order #${order.orderNumber} accepted successfully!`);
    } catch (err) {
      setError(`Failed to accept order: ${err.message}`);
    }
  };

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted':
        return 'Heading to Restaurant';
      case 'picked_up':
        return 'In Transit';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'picked_up':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Simple toast notification function
  const toast = (message) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    
    setTimeout(() => {
      toastEl.remove();
    }, 3000);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Orders & Deliveries</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Order Details Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Order #{selectedDelivery.orderNumber} Details</h3>
              <button 
                onClick={() => setSelectedDelivery(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Restaurant:</p>
              <p className="font-medium">{selectedDelivery.restaurantName}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Delivery Address:</p>
              <p className="font-medium">{selectedDelivery.dropoffAddress}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Customer:</p>
              <p className="font-medium">{selectedDelivery.customerName}</p>
              <p className="text-gray-600">{selectedDelivery.customerPhone}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Status:</p>
              <p className={`font-medium ${getStatusClasses(selectedDelivery.status)} inline-block px-2 py-1 rounded`}>
                {getStatusText(selectedDelivery.status)}
              </p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Order Items:</p>
              <ul className="mt-2 border rounded-md divide-y">
                {selectedDelivery.items.map((item, index) => (
                  <li key={index} className="p-2 flex justify-between">
                    <span>{item.quantity}x {item.name || `Item ${index + 1}`}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Order Total:</p>
              <p className="font-medium">${typeof selectedDelivery.totalAmount === 'number' ? selectedDelivery.totalAmount.toFixed(2) : selectedDelivery.totalAmount}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Your Earnings:</p>
              <p className="font-medium text-green-600">${selectedDelivery.estimatedEarnings}</p>
            </div>
            
            <div className="mt-6">
              <button 
                onClick={() => setSelectedDelivery(null)}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* New Orders Section */}
      {orders.length > 0 ? (
        <>
          <h3 className="text-xl font-bold mb-4">New Orders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{order.restaurantName}</h3>
                    <p className="text-gray-600 mt-1">Order #{order.orderNumber}</p>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    New Order
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Dropoff Location:</p>
                  <p className="font-medium">{order.dropoffAddress}</p>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Order Total:</p>
                  <p className="font-medium">${typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : order.totalAmount}</p>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Estimated Earnings:</p>
                  <p className="font-medium text-green-600">${order.estimatedEarnings}</p>
                </div>
                
                <div className="mt-6">
                  <button 
                    onClick={() => handleAcceptOrder(order)}
                    className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
                  >
                    Accept Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 mb-8">
          No new orders available at the moment.
        </div>
      )}
      
      {/* Active Deliveries Section */}
      <h3 className="text-xl font-bold mb-4">Active Deliveries</h3>
      {activeDeliveries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No active deliveries at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeDeliveries.map(delivery => (
            <div key={delivery._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{delivery.restaurantName}</h3>
                  <p className="text-gray-600 mt-1">Order #{delivery.orderNumber}</p>
                </div>
                <div className={`${getStatusClasses(delivery.status)} px-3 py-1 rounded-full text-sm`}>
                  {getStatusText(delivery.status)}
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">Dropoff Location:</p>
                <p className="font-medium">{delivery.dropoffAddress}</p>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">Customer:</p>
                <p className="font-medium">{delivery.customerName}</p>
                <p className="text-gray-600">{delivery.customerPhone}</p>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">Earnings:</p>
                <p className="font-medium text-green-600">${delivery.estimatedEarnings}</p>
              </div>
              
              <div className="mt-8 border-t pt-4">
                <h4 className="font-bold mb-2">Order Timeline</h4>
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-full w-4 h-4"></div>
                  <div className={delivery.status === 'accepted' ? 'bg-gray-300 h-1 flex-1' : 'bg-black h-1 flex-1'}></div>
                  <div className={delivery.status === 'accepted' ? 'rounded-full w-4 h-4 bg-gray-300' : 'rounded-full w-4 h-4 bg-green-500'}></div>
                  <div className={delivery.status === 'delivered' ? 'bg-green-500 h-1 flex-1' : 'bg-gray-300 h-1 flex-1'}></div>
                  <div className={delivery.status === 'delivered' ? 'rounded-full w-4 h-4 bg-green-500' : 'rounded-full w-4 h-4 bg-gray-300'}></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>Accepted</span>
                  <span>Picked Up</span>
                  <span>Delivered</span>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => handleViewDetails(delivery)}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600"
                >
                  View Details
                </button>
                
                {delivery.status === 'accepted' && (
                  <button 
                    onClick={() => updateDeliveryStatus(delivery._id, 'picked_up')}
                    className="flex-1 bg-black text-white py-3 rounded-md hover:bg-gray-800"
                  >
                    Mark as Picked Up
                  </button>
                )}
                
                {delivery.status === 'picked_up' && (
                  <button 
                    onClick={() => updateDeliveryStatus(delivery._id, 'delivered')}
                    className="flex-1 bg-green-500 text-white py-3 rounded-md hover:bg-green-600"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveDeliveries;