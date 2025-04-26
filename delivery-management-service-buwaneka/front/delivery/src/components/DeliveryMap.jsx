import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Fallback component in case Google Maps fails to load
const MapFallback = () => (
  <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center h-full">
    <p className="text-gray-600 mb-2">Unable to load map</p>
    <p className="text-sm text-gray-500">Please check your API key and internet connection</p>
  </div>
);

const DeliveryMap = ({ delivery, driverLocation }) => {
  const [directions, setDirections] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapError, setMapError] = useState(false);
  const directionsService = useRef(null);

  // Default center (will be overridden when locations are available)
  const [center, setCenter] = useState({
    lat: 37.7749, // Default to San Francisco
    lng: -122.4194
  });

  const onLoad = useCallback(map => {
    setMapInstance(map);
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
  }, []);

  // Handle API load error
  const handleLoadError = useCallback(() => {
    console.error("Error loading Google Maps API");
    setMapError(true);
  }, []);

  useEffect(() => {
    if (!directionsService.current || !delivery || !driverLocation || !window.google) return;

    try {
      // For "accepted" status, route is from driver to restaurant
      // For "picked_up" status, route is from restaurant to customer
      const origin = delivery.status === 'accepted' 
        ? { lat: driverLocation.lat, lng: driverLocation.lng } 
        : { lat: delivery.pickupLocation.lat, lng: delivery.pickupLocation.lng };
      
      const destination = delivery.status === 'accepted'
        ? { lat: delivery.pickupLocation.lat, lng: delivery.pickupLocation.lng }
        : { lat: delivery.dropoffLocation.lat, lng: delivery.dropoffLocation.lng };

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
          }
        }
      );
    } catch (error) {
      console.error("Error calculating directions:", error);
    }
  }, [delivery, driverLocation, mapInstance]);

  // Update center when driverLocation changes
  useEffect(() => {
    if (driverLocation) {
      setCenter(driverLocation);
    }
  }, [driverLocation]);

  // Return early if no delivery or locations provided
  if (!delivery || !delivery.pickupLocation || !delivery.dropoffLocation) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-gray-600 text-center h-full flex items-center justify-center">
        <p>Waiting for delivery location data...</p>
      </div>
    );
  }

  if (mapError) {
    return <MapFallback />;
  }

  // Use a placeholder API key for development
  // In production, you should use environment variables
//   const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;


  return (
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
          />
        )}

        {/* Restaurant location */}
        <Marker
          position={delivery.pickupLocation}
          onClick={() => setSelectedMarker('restaurant')}
        />

        {/* Customer location */}
        <Marker
          position={delivery.dropoffLocation}
          onClick={() => setSelectedMarker('customer')}
        />

        {/* Info Windows */}
        {selectedMarker === 'driver' && (
          <InfoWindow
            position={driverLocation}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2">
              <p className="font-bold">Your Location</p>
            </div>
          </InfoWindow>
        )}

        {selectedMarker === 'restaurant' && (
          <InfoWindow
            position={delivery.pickupLocation}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2">
              <p className="font-bold">{delivery.restaurantName || 'Restaurant'}</p>
              <p className="text-sm">{delivery.pickupAddress || 'Pickup Location'}</p>
            </div>
          </InfoWindow>
        )}

        {selectedMarker === 'customer' && (
          <InfoWindow
            position={delivery.dropoffLocation}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2">
              <p className="font-bold">{delivery.customerName || 'Customer'}</p>
              <p className="text-sm">{delivery.dropoffAddress || 'Dropoff Location'}</p>
            </div>
          </InfoWindow>
        )}

        {/* Directions */}
        {directions && (
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
  );
};

export default DeliveryMap;