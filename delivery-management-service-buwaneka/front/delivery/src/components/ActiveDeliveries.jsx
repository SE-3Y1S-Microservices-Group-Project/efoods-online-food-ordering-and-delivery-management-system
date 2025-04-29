import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeliveryMap from './DeliveryMap'; 

const ActiveDeliveries = () => {
  const [orders, setOrders] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false); // New state to control modal visibility
  const [claimedOrderIds, setClaimedOrderIds] = useState([]);
  const [deliveredOrderIds, setDeliveredOrderIds] = useState([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  // Updated to match default values in DeliveryMap for consistency
  const [driverLocation, setDriverLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Track driver's location with improved error handling
  useEffect(() => {
    if (navigator.geolocation) {
      // Set default location while waiting for real position
      setDriverLocation({ lat: 6.927079, lng: 79.861244 }); // Default to Sri Lanka coordinates as in DeliveryMap
      
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null); // Clear any previous errors
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(`Location error: ${error.message}`);
          // Don't reset driver location - keep the default
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
      
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setLocationError("Geolocation is not supported by your browser");
    }
  }, []);

  // Load claimed and delivered orders from localStorage on component mount
  useEffect(() => {
    try {
      const storedClaimedIds = localStorage.getItem('claimedOrderIds');
      if (storedClaimedIds) {
        setClaimedOrderIds(JSON.parse(storedClaimedIds));
      }
      
      // Load delivered order IDs
      const storedDeliveredIds = localStorage.getItem('deliveredOrderIds');
      if (storedDeliveredIds) {
        setDeliveredOrderIds(JSON.parse(storedDeliveredIds));
      }
    } catch (err) {
      console.error('Failed to load order IDs from localStorage:', err);
    }
  }, []);

  // Function to fetch restaurant details
  const fetchRestaurantDetails = async (restaurantId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`http://localhost:5001/api/drivers/restaurants/${restaurantId}/address`, { headers });
      return response.data.data;
    } catch (err) {
      console.error(`Failed to fetch restaurant details for ID ${restaurantId}:`, err);
      return null;
    }
  };

  // Enhanced function to enrich orders with restaurant data and location coordinates
  const enrichOrdersWithRestaurantData = async (ordersData) => {
    const enrichedOrders = [];
    
    for (const order of ordersData) {
      let restaurantDetails = null;
      
      // Only fetch restaurant details if we have a valid restaurant ID
      if (order.items && order.items.length > 0 && order.items[0].restaurantId) {
        restaurantDetails = await fetchRestaurantDetails(order.items[0].restaurantId);
      }
      
      // Create basic order structure
      const enrichedOrder = {
        _id: order._id || `order-${Math.random().toString(36).substr(2, 9)}`,
        orderNumber: order._id ? order._id.toString().slice(-6) : Math.floor(100000 + Math.random() * 900000).toString(),
        restaurantName: restaurantDetails ? restaurantDetails.name : `Restaurant ${order.items[0]?.restaurantId?.toString().slice(-4) || "Unknown"}`,
        restaurantAddress: restaurantDetails ? restaurantDetails.fullAddress : null,
        dropoffAddress: order.shippingInfo
          ? `${order.shippingInfo.address || ''}, ${order.shippingInfo.city || ''}, ${order.shippingInfo.postalCode || ''}`
          : "123 Sample St, Springfield, 12345",
        customerName: order.customerName || "Customer Name", 
        customerPhone: order.customerPhone || "123-456-7890", 
        estimatedEarnings: order.totalAmount ? (order.totalAmount * 0.15).toFixed(2) : "5.00",
        status: 'new',
        items: order.items || [{quantity: 1, name: "Test Item"}],
        totalAmount: order.totalAmount || 25.00,
        // Add empty location objects for DeliveryMap component
        pickupLocation: { lat: null, lng: null },
        dropoffLocation: { lat: null, lng: null }
      };
      
      // Check if the order already has location data
      if (order.pickupLocation && typeof order.pickupLocation.lat === 'number' && typeof order.pickupLocation.lng === 'number') {
        enrichedOrder.pickupLocation = order.pickupLocation;
      }
      
      if (order.dropoffLocation && typeof order.dropoffLocation.lat === 'number' && typeof order.dropoffLocation.lng === 'number') {
        enrichedOrder.dropoffLocation = order.dropoffLocation;
      }
      
      enrichedOrders.push(enrichedOrder);
    }
    
    return enrichedOrders;
  };

  // Fetch orders from the connected database
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get('http://localhost:5001/api/drivers/orders', { headers });
        console.log('API Response:', response.data);
        
        // Check if data is in the expected format
        let ordersData;
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        } else if (Array.isArray(response.data)) {
          ordersData = response.data;
        } else {
          // For testing, create dummy data when no orders are returned
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
        
        // Enrich orders with restaurant data
        const enrichedOrders = await enrichOrdersWithRestaurantData(ordersData);
        
        // Filter out orders that have been claimed or delivered by this driver
        const availableOrders = enrichedOrders.filter(order => 
          order._id && 
          !claimedOrderIds.includes(order._id) && 
          !deliveredOrderIds.includes(order._id)
        );
        
        console.log('Available orders after filtering and enrichment:', availableOrders);
        setOrders(availableOrders);
        
        // Get active deliveries from localStorage
        try {
          const storedDeliveries = localStorage.getItem('activeDeliveries');
          if (storedDeliveries) {
            const activeOrdersFromStorage = JSON.parse(storedDeliveries);
            console.log('Active deliveries from storage:', activeOrdersFromStorage);
            
            if (Array.isArray(activeOrdersFromStorage) && activeOrdersFromStorage.length > 0) {
              // Make sure all stored deliveries have the expected location structure
              const validatedDeliveries = activeOrdersFromStorage.map(delivery => {
                // Ensure pickup and dropoff locations exist
                if (!delivery.pickupLocation) delivery.pickupLocation = { lat: null, lng: null };
                if (!delivery.dropoffLocation) delivery.dropoffLocation = { lat: null, lng: null };
                return delivery;
              });
              
              setActiveDeliveries(validatedDeliveries);
              
              // If we have a selected delivery ID, find and set the selected delivery
              if (selectedDeliveryId) {
                const selected = validatedDeliveries.find(d => d._id === selectedDeliveryId);
                if (selected) {
                  setSelectedDelivery(selected);
                  // Don't set showDetailsModal here - it should only show when the View Details button is clicked
                }
              }
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
            totalAmount: 35.00,
            pickupLocation: { lat: null, lng: null },
            dropoffLocation: { lat: null, lng: null }
          }
        ];
        // Filter out claimed and delivered orders even with dummy data
        const filteredDummyOrders = dummyOrders.filter(order => 
          !claimedOrderIds.includes(order._id) && 
          !deliveredOrderIds.includes(order._id)
        );
        setOrders(filteredDummyOrders);
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Set up interval to refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [claimedOrderIds, deliveredOrderIds, selectedDeliveryId]);

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

  // Function to update earnings data
  const updateEarningsData = (delivery) => {
    try {
      // Get current earnings data
      const earningsData = JSON.parse(localStorage.getItem('earningsData')) || {
        total: 0,
        deliveries: 0,
        tips: 0,
        bonuses: 0,
        count: 0,
        history: []
      };

      // Parse the estimated earnings amount
      const earningsAmount = parseFloat(delivery.estimatedEarnings);
      
      // Calculate tip amount (assume 40% of earnings is from tips)
      const tipAmount = earningsAmount * 0.4;
      
      // Calculate delivery pay (assume 60% of earnings is from delivery pay)
      const deliveryPay = earningsAmount * 0.6;
      
      // Update earnings data
      earningsData.total += earningsAmount;
      earningsData.deliveries += deliveryPay;
      earningsData.tips += tipAmount;
      earningsData.count += 1;
      
      // Add to history
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Check if there's an entry for today
      const todayEntry = earningsData.history.find(entry => entry.date === formattedDate);
      
      if (todayEntry) {
        // Update existing entry
        todayEntry.amount += earningsAmount;
        todayEntry.deliveries += 1;
      } else {
        // Create new entry
        earningsData.history.push({
          id: Date.now(),
          date: formattedDate,
          amount: earningsAmount,
          deliveries: 1,
          status: 'Paid'
        });
      }
      
      // Save updated earnings data
      localStorage.setItem('earningsData', JSON.stringify(earningsData));
      console.log('Updated earnings data:', earningsData);
    } catch (err) {
      console.error('Failed to update earnings data:', err);
    }
  };

  const updateDeliveryStatus = async (deliveryId, status) => {
    try {
      // Find the delivery in the active deliveries
      const delivery = activeDeliveries.find(d => d._id === deliveryId);
      
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

        // Call the backend to update order status
        try {
          const token = localStorage.getItem('token');
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          
          await axios.put(`http://localhost:5001/api/orders/${deliveryId}/status`, 
            { status },
            { headers }
          );
          console.log(`Order ${deliveryId} status updated to ${status} in backend`);
        } catch (apiErr) {
          console.error('Failed to update status in backend:', apiErr);
          // Continue with local updates even if API call fails
        }
      } else if (status === 'delivered') {
        // Add earnings data before removing the delivery
        if (delivery) {
          updateEarningsData(delivery);
        }
        
        // Remove from active list if delivered
        const updatedDeliveries = activeDeliveries.filter(delivery => delivery._id !== deliveryId);
        setActiveDeliveries(updatedDeliveries);
        
        // Update localStorage to remove the delivery
        try {
          localStorage.setItem('activeDeliveries', JSON.stringify(updatedDeliveries));
        } catch (err) {
          console.error('Failed to update localStorage:', err);
        }
        
        // Clear selected delivery if this was the one
        if (selectedDelivery && selectedDelivery._id === deliveryId) {
          setSelectedDelivery(null);
          setSelectedDeliveryId(null); // Also clear the ID for the map component
          setShowDetailsModal(false); // Make sure to close the modal
        }
        
        // Remove from claimedOrderIds when order is delivered
        const updatedClaimedIds = claimedOrderIds.filter(id => id !== deliveryId);
        setClaimedOrderIds(updatedClaimedIds);
        localStorage.setItem('claimedOrderIds', JSON.stringify(updatedClaimedIds));
        
        // Add to deliveredOrderIds when order is delivered
        const updatedDeliveredIds = [...deliveredOrderIds, deliveryId];
        setDeliveredOrderIds(updatedDeliveredIds);
        localStorage.setItem('deliveredOrderIds', JSON.stringify(updatedDeliveredIds));
        
        toast(`Order delivered successfully!`);
        
        // Delete the order from the order microservice database
        try {
          const token = localStorage.getItem('token');
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          
          // Call the delete endpoint
          await axios.delete(`http://localhost:5001/api/drivers/orders/${deliveryId}`, { headers });
          console.log(`Order ${deliveryId} deleted from order microservice database`);
        } catch (apiErr) {
          console.error('Failed to delete order from database:', apiErr);
          // Continue with local updates even if API call fails
        }
      }
    } catch (err) {
      setError(`Failed to update delivery status: ${err.message}`);
    }
  };

  const handleAcceptOrder = async (order) => {
    try {
      // Add an API call to mark order as claimed by this driver
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const driverId = localStorage.getItem('userId'); // Assuming driver ID is stored here
        
        await axios.post(`http://localhost:5001/api/orders/${order._id}/claim`, 
          { driverId: driverId || 'current-driver' },
          { headers }
        );
        console.log(`Order ${order._id} claimed in backend`);
      } catch (apiErr) {
        console.error('Failed to claim order in backend:', apiErr);
        // Continue with local updates even if API call fails
      }
      
      // Remove from orders list
      const updatedOrders = orders.filter(o => o._id !== order._id);
      setOrders(updatedOrders);
      
      // Add to active deliveries with proper location structure
      const newDelivery = {
        ...order,
        status: 'accepted',
        // Ensure location objects are properly defined
        pickupLocation: order.pickupLocation || { lat: null, lng: null },
        dropoffLocation: order.dropoffLocation || { lat: null, lng: null }
      };
      
      const updatedDeliveries = [...activeDeliveries, newDelivery];
      setActiveDeliveries(updatedDeliveries);
      
      // Track claimed order ID to prevent it from showing up again
      const updatedClaimedIds = [...claimedOrderIds, order._id];
      setClaimedOrderIds(updatedClaimedIds);
      
      // Update localStorage
      try {
        localStorage.setItem('activeDeliveries', JSON.stringify(updatedDeliveries));
        localStorage.setItem('claimedOrderIds', JSON.stringify(updatedClaimedIds));
      } catch (err) {
        console.error('Failed to update localStorage:', err);
      }
      
      // Set this as the selected delivery
      setSelectedDelivery(newDelivery);
      setSelectedDeliveryId(newDelivery._id);
      // Don't show modal here, just select the delivery for the map
      
      toast(`Order #${order.orderNumber} accepted successfully!`);
    } catch (err) {
      setError(`Failed to accept order: ${err.message}`);
    }
  };

  // Updated to also open the modal
  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setSelectedDeliveryId(delivery._id);
    setShowDetailsModal(true); // Show the modal when View Details is clicked
  };

  // Function to close the modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    // Don't clear the selectedDelivery or selectedDeliveryId here
    // so the map stays focused on the selected delivery
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
      
      {locationError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Warning: {locationError} - Using default location for mapping.
        </div>
      )}
      
      {/* Order Details Modal - Now controlled by showDetailsModal state */}
      {selectedDelivery && showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Order #{selectedDelivery.orderNumber} Details</h3>
              <button 
                onClick={closeDetailsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Restaurant:</p>
              <p className="font-medium">{selectedDelivery.restaurantName}</p>
              {selectedDelivery.restaurantAddress && (
                <p className="text-gray-600">{selectedDelivery.restaurantAddress}</p>
              )}
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Delivery Address:</p>
              <p className="font-medium">{selectedDelivery.dropoffAddress}</p>
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
              <p className="font-medium">USD {typeof selectedDelivery.totalAmount === 'number' ? selectedDelivery.totalAmount.toFixed(2) : selectedDelivery.totalAmount}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Your Earnings:</p>
              <p className="font-medium text-green-600">USD {selectedDelivery.estimatedEarnings}</p>
            </div>
            
            <div className="mt-6">
              <button 
                onClick={closeDetailsModal}
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
                  <p className="font-medium">USD {typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : order.totalAmount}</p>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Estimated Earnings:</p>
                  <p className="font-medium text-green-600">USD {order.estimatedEarnings}</p>
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
      
      {/* Delivery Map Section */}
      {activeDeliveries && activeDeliveries.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Delivery Map</h3>
          <div className="bg-white rounded-lg shadow" style={{ height: "500px" }}>
            <DeliveryMap 
              activeDeliveries={activeDeliveries}
              selectedDeliveryId={selectedDeliveryId}
              setSelectedDeliveryId={setSelectedDeliveryId}
              driverLocation={driverLocation}
            />
          </div>
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
              
              {delivery.restaurantAddress && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Restaurant Address:</p>
                  <p className="font-medium">{delivery.restaurantAddress}</p>
                </div>
              )}
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">Dropoff Location:</p>
                <p className="font-medium">{delivery.dropoffAddress}</p>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">Earnings:</p>
                <p className="font-medium text-green-600">USD {delivery.estimatedEarnings}</p>
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