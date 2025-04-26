import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Marker colors
const markerIcons = {
  driver: {
    path: "M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z",
    fillColor: '#4285F4',
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: '#FFFFFF',
    scale: 1.5
  },
  restaurant: {
    path: "M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z",
    fillColor: '#EA4335',
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: '#FFFFFF',
    scale: 1.5
  },
  customer: {
    path: "M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z",
    fillColor: '#FBBC05',
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: '#FFFFFF',
    scale: 1.5
  }
};

// Fallback component in case Google Maps fails to load
const MapFallback = () => (
  <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center h-full">
    <p className="text-gray-600 mb-2">Unable to load map</p>
    <p className="text-sm text-gray-500">Please check your API key and internet connection</p>
  </div>
);

const DeliveryMap = ({ activeDeliveries, selectedDeliveryId, setSelectedDeliveryId, driverLocation }) => {
  const [directions, setDirections] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapError, setMapError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const directionsService = useRef(null);

  // Default center (will be overridden when locations are available)
  const [center, setCenter] = useState({
    lat: 37.7749, // Default center
    lng: -122.4194
  });

  // Find the currently selected delivery
  const selectedDelivery = activeDeliveries?.find(d => d._id === selectedDeliveryId) || null;

  const onLoad = useCallback(map => {
    setMapInstance(map);
    setIsLoaded(true);
    try {
      const google = window.google;
      if (google && google.maps) {
        directionsService.current = new google.maps.DirectionsService();
      }
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      setMapError(true);
    }
  }, []);

  const onUnmount = useCallback(() => {
    setMapInstance(null);
    directionsService.current = null;
    setIsLoaded(false);
  }, []);

  // Handle API load error
  const handleLoadError = useCallback(() => {
    console.error("Error loading Google Maps API");
    setMapError(true);
  }, []);

  // Update center based on driver or selected delivery
  useEffect(() => {
    if (driverLocation) {
      setCenter(driverLocation);
    } else if (selectedDelivery && selectedDelivery.pickupLocation) {
      setCenter(selectedDelivery.pickupLocation);
    }
  }, [driverLocation, selectedDelivery]);

  // Calculate directions for selected delivery
  useEffect(() => {
    if (!directionsService.current || !selectedDelivery || !driverLocation || !isLoaded || !window.google) {
      return;
    }

    try {
      // For "accepted" status, route is from driver to restaurant
      // For "picked_up" status, route is from restaurant to customer
      const origin = selectedDelivery.status === 'accepted' 
        ? { lat: driverLocation.lat, lng: driverLocation.lng } 
        : { lat: selectedDelivery.pickupLocation.lat, lng: selectedDelivery.pickupLocation.lng };
      
      const destination = selectedDelivery.status === 'accepted'
        ? { lat: selectedDelivery.pickupLocation.lat, lng: selectedDelivery.pickupLocation.lng }
        : { lat: selectedDelivery.dropoffLocation.lat, lng: selectedDelivery.dropoffLocation.lng };

      directionsService.current.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            
            // Set the map bounds to fit all markers and route
            if (mapInstance) {
              const bounds = new window.google.maps.LatLngBounds();
              bounds.extend(origin);
              bounds.extend(destination);
              mapInstance.fitBounds(bounds);
            }
          } else {
            console.error(`Error fetching directions: ${status}`);
            setDirections(null);
          }
        }
      );
    } catch (error) {
      console.error("Error calculating directions:", error);
      setDirections(null);
    }
  }, [selectedDelivery, driverLocation, mapInstance, isLoaded]);

  // Function to handle delivery selection
  const handleDeliverySelection = (deliveryId) => {
    setSelectedDeliveryId(deliveryId);
  };

  if (mapError) {
    return <MapFallback />;
  }

  // No deliveries case
  if (!activeDeliveries || activeDeliveries.length === 0) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-gray-600 text-center h-full flex items-center justify-center">
        <p>No active deliveries to display</p>
      </div>
    );
  }

  // Use environment variable for API key
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <div className="relative h-full">
      <LoadScript
        googleMapsApiKey={apiKey}
        libraries={["places"]}
        onError={handleLoadError}
        loadingElement={
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-600">Loading map...</p>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControl: true
          }}
        >
          {/* Driver's current location */}
          {driverLocation && (
            <Marker
              position={driverLocation}
              onClick={() => setSelectedMarker('driver')}
              icon={markerIcons.driver}
              zIndex={10}
            />
          )}

          {/* Show all deliveries if no specific one is selected, or just the selected one */}
          {activeDeliveries.map(delivery => {
            // Skip if not the selected delivery (when one is selected)
            if (selectedDeliveryId && delivery._id !== selectedDeliveryId) {
              return null;
            }

            return (
              <React.Fragment key={delivery._id}>
                {/* Restaurant location */}
                {delivery.pickupLocation && (
                  <Marker
                    position={delivery.pickupLocation}
                    onClick={() => {
                      setSelectedMarker(`restaurant-${delivery._id}`);
                      handleDeliverySelection(delivery._id);
                    }}
                    icon={markerIcons.restaurant}
                    zIndex={5}
                  />
                )}

                {/* Customer location */}
                {delivery.dropoffLocation && (
                  <Marker
                    position={delivery.dropoffLocation}
                    onClick={() => {
                      setSelectedMarker(`customer-${delivery._id}`);
                      handleDeliverySelection(delivery._id);
                    }}
                    icon={markerIcons.customer}
                    zIndex={5}
                  />
                )}

                {/* Info Windows for this delivery */}
                {selectedMarker === `restaurant-${delivery._id}` && delivery.pickupLocation && (
                  <InfoWindow
                    position={delivery.pickupLocation}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <div className="p-2">
                      <p className="font-bold">{delivery.restaurantName || 'Restaurant'}</p>
                      <p className="text-sm">{delivery.pickupAddress || 'Pickup Location'}</p>
                      <p className="text-xs mt-1">Order #{delivery.orderNumber}</p>
                    </div>
                  </InfoWindow>
                )}

                {selectedMarker === `customer-${delivery._id}` && delivery.dropoffLocation && (
                  <InfoWindow
                    position={delivery.dropoffLocation}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <div className="p-2">
                      <p className="font-bold">{delivery.customerName || 'Customer'}</p>
                      <p className="text-sm">{delivery.dropoffAddress || 'Dropoff Location'}</p>
                      <p className="text-xs mt-1">Order #{delivery.orderNumber}</p>
                    </div>
                  </InfoWindow>
                )}
              </React.Fragment>
            );
          })}

          {/* Driver info window */}
          {selectedMarker === 'driver' && driverLocation && (
            <InfoWindow
              position={driverLocation}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2">
                <p className="font-bold">Your Location</p>
              </div>
            </InfoWindow>
          )}

          {/* Directions for selected delivery */}
          {selectedDelivery && directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#FF8C00',
                  strokeWeight: 5
                }
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {/* Delivery selector overlay */}
      {activeDeliveries.length > 1 && (
        <div className="absolute top-4 left-0 right-0 mx-auto w-max">
          <div className="bg-white rounded-lg shadow-lg p-2">
            <select 
              className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDeliveryId || ''}
              onChange={(e) => handleDeliverySelection(e.target.value)}
            >
              <option value="">All Deliveries</option>
              {activeDeliveries.map(delivery => (
                <option key={delivery._id} value={delivery._id}>
                  {delivery.restaurantName} - Order #{delivery.orderNumber}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Route info overlay */}
      {selectedDelivery && directions && directions.routes && directions.routes[0] && (
        <div className="absolute bottom-4 left-0 right-0 mx-auto w-max">
          <div className="bg-white rounded-lg shadow-lg p-3">
            <div className="text-center">
              <p className="font-bold">
                {selectedDelivery.status === 'accepted' ? 'To Restaurant' : 'To Customer'}
              </p>
              <p className="text-sm">
                {directions.routes[0].legs[0].distance.text} • {directions.routes[0].legs[0].duration.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryMap;