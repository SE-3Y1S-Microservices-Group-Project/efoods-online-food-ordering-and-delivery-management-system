import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeliveryMap from './DeliveryMap';
import useGeolocation from '../hooks/useGeolocation';
import locationService from '../services/LocationService.js';

const ActiveDeliveries = () => {
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showMap, setShowMap] = useState(false);
  
  // Get current geolocation of driver
  const { location: driverLocation, error: locationError } = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 5000
  });

  useEffect(() => {
    const fetchActiveDeliveries = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/deliveries/active', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // For each delivery, get geocoded locations for pickup and dropoff
        const deliveriesWithLocations = await Promise.all(
          response.data.map(async (delivery) => {
            try {
              // Only geocode if we don't already have coordinates
              if (!delivery.pickupLocation) {
                const pickupGeocode = await locationService.getGeocodedLocation(delivery.pickupAddress);
                delivery.pickupLocation = pickupGeocode;
              }
              
              if (!delivery.dropoffLocation) {
                const dropoffGeocode = await locationService.getGeocodedLocation(delivery.dropoffAddress);
                delivery.dropoffLocation = dropoffGeocode;
              }
              
              return delivery;
            } catch (err) {
              console.error(`Error geocoding for delivery ${delivery._id}:`, err);
              return delivery;
            }
          })
        );
        
        setActiveDeliveries(deliveriesWithLocations);
        
        // Auto-select the first delivery if there is one and none is selected
        if (deliveriesWithLocations.length > 0 && !selectedDelivery) {
          setSelectedDelivery(deliveriesWithLocations[0]);
          setShowMap(true);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch active deliveries');
        setLoading(false);
      }
    };

    fetchActiveDeliveries();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchActiveDeliveries, 30000);
    return () => clearInterval(interval);
  }, [selectedDelivery]);

  // Update driver location on the server when it changes
  useEffect(() => {
    if (driverLocation) {
      locationService.updateDriverLocation(driverLocation)
        .catch(err => console.error('Failed to update driver location:', err));
    }
  }, [driverLocation]);

  const updateDeliveryStatus = async (deliveryId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/deliveries/${deliveryId}/status`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state
      if (status === 'picked_up') {
        setActiveDeliveries(activeDeliveries.map(delivery => 
          delivery._id === deliveryId ? { ...delivery, status } : delivery
        ));
        
        // Update selected delivery if this is the one
        if (selectedDelivery && selectedDelivery._id === deliveryId) {
          setSelectedDelivery({ ...selectedDelivery, status });
        }
      } else if (status === 'delivered') {
        // Remove from active list if delivered
        setActiveDeliveries(activeDeliveries.filter(delivery => delivery._id !== deliveryId));
        
        // Clear selected delivery if this was the one
        if (selectedDelivery && selectedDelivery._id === deliveryId) {
          setSelectedDelivery(null);
          setShowMap(false);
        }
      }
    } catch (err) {
      setError(`Failed to update delivery status: ${err.message}`);
    }
  };

  const handleViewMap = (delivery) => {
    setSelectedDelivery(delivery);
    setShowMap(true);
  };

  const handleCloseMap = () => {
    setShowMap(false);
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

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Active Deliveries</h2>
      
      {locationError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Location services error: {locationError}. Some map features may not work correctly.
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {showMap && selectedDelivery && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Delivery Route Map</h3>
            <button 
              onClick={handleCloseMap}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Close Map
            </button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <DeliveryMap delivery={selectedDelivery} driverLocation={driverLocation} />
          </div>
        </div>
      )}
      
      {activeDeliveries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No active deliveries at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
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
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Pickup Location:</p>
                  <p className="font-medium">{delivery.pickupAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dropoff Location:</p>
                  <p className="font-medium">{delivery.dropoffAddress}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">Customer:</p>
                <p className="font-medium">{delivery.customerName}</p>
                <p className="text-gray-600">{delivery.customerPhone}</p>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">Earnings:</p>
                <p className="font-medium text-green-600">${delivery.estimatedEarnings.toFixed(2)}</p>
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
                  onClick={() => handleViewMap(delivery)}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600"
                >
                  View Map
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