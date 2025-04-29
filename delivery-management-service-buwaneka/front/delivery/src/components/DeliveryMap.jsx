import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';

// Define libraries OUTSIDE the component to avoid re-renders
const mapLibraries = ["places"];

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
  const [deliveriesWithCoordinates, setDeliveriesWithCoordinates] = useState([]);
  const [geocodingComplete, setGeocodingComplete] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState("Initializing map...");
  
  const directionsService = useRef(null);
  const geocoderRef = useRef(null);

  // Use the useJsApiLoader hook instead of LoadScript
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  const { isLoaded: apiLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: mapLibraries,
  });

  // Set map error if loadError occurs
  useEffect(() => {
    if (loadError) {
      console.error("Error loading Google Maps API:", loadError);
      setMapError(true);
    }
  }, [loadError]);

  // Debug logging of props
  useEffect(() => {
    console.log("DeliveryMap props:", {
      activeDeliveriesLength: activeDeliveries?.length,
      hasSelectedDeliveryId: !!selectedDeliveryId,
      hasDriverLocation: !!driverLocation,
      driverLocationCoords: driverLocation
    });
    console.log("API Key available:", !!apiKey);
  }, [activeDeliveries, selectedDeliveryId, driverLocation, apiKey]);

  // Default center (will be overridden when locations are available)
  const [center, setCenter] = useState({
    lat: driverLocation?.lat || 6.927079,  // Default to Sri Lanka coordinates
    lng: driverLocation?.lng || 79.861244
  });

  // Find the currently selected delivery
  const selectedDelivery = useMemo(() => {
    return deliveriesWithCoordinates.find(d => d._id === selectedDeliveryId) || null;
  }, [deliveriesWithCoordinates, selectedDeliveryId]);

  // Handle map load
  const onLoad = useCallback(map => {
    console.log("Map loaded successfully");
    setMapInstance(map);
    
    try {
      if (window.google && window.google.maps) {
        directionsService.current = new window.google.maps.DirectionsService();
        geocoderRef.current = new window.google.maps.Geocoder();
        console.log("Google services initialized");
      } else {
        console.error("Google Maps API not available after map load");
        setMapError(true);
      }
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      setMapError(true);
    }
  }, []);

  const onUnmount = useCallback(() => {
    setMapInstance(null);
    directionsService.current = null;
    geocoderRef.current = null;
  }, []);

  // Initialize deliveries with existing coordinates before geocoding
  useEffect(() => {
    if (activeDeliveries && activeDeliveries.length > 0) {
      // Copy all deliveries to state first, regardless of coordinates
      setDeliveriesWithCoordinates([...activeDeliveries]);
    }
  }, [activeDeliveries]);

  // Helper function to convert address to coordinates - returns a Promise
  const geocodeAddress = async (address, tag) => {
    if (!address || !geocoderRef.current) {
      return null;
    }
    
    try {
      const result = await new Promise((resolve, reject) => {
        geocoderRef.current.geocode({ address }, (results, status) => {
          if (status === "OK" && results[0]) {
            resolve({
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            });
          } else {
            console.warn(`Failed to geocode ${tag} address: ${address}, status: ${status}`);
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
      
      return result;
    } catch (error) {
      console.error(`Error geocoding ${tag} address:`, error);
      return null;
    }
  };

  // Geocode addresses to coordinates - BUT ONLY AFTER map is fully loaded
  useEffect(() => {
    // Ensure all dependencies are available before proceeding
    if (!activeDeliveries || activeDeliveries.length === 0 || !apiLoaded || !window.google) {
      if (activeDeliveries?.length > 0) {
        setLoadingProgress("Waiting for map API to initialize...");
      }
      return;
    }

    // Initialize geocoder if not already done
    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }

    setLoadingProgress("Geocoding addresses...");
    console.log("Starting geocoding process for", activeDeliveries.length, "deliveries");
    
    const geocoder = geocoderRef.current;
    const deliveriesWithCoords = JSON.parse(JSON.stringify(activeDeliveries)); // Deep clone
    
    // Use async/await for cleaner geocoding
    const processGeocodingAsync = async () => {
      for (let i = 0; i < deliveriesWithCoords.length; i++) {
        const delivery = deliveriesWithCoords[i];
        
        // Ensure location objects exist
        if (!delivery.pickupLocation) delivery.pickupLocation = {};
        if (!delivery.dropoffLocation) delivery.dropoffLocation = {};
        
        // First, check if we have a restaurant address to geocode
        if (delivery.restaurantAddress && (!delivery.pickupLocation.lat || !delivery.pickupLocation.lng)) {
          console.log(`Geocoding restaurant address for ${delivery._id}: ${delivery.restaurantAddress}`);
          try {
            const coords = await geocodeAddress(delivery.restaurantAddress, "restaurant");
            if (coords) {
              delivery.pickupLocation = coords;
              delivery.pickupAddress = delivery.restaurantAddress; // Use restaurant address as pickup address
              console.log(`Successfully geocoded restaurant address for ${delivery._id}:`, coords);
            } else {
              // Fallback for restaurant location
              delivery.pickupLocation = {
                lat: (driverLocation?.lat || 6.927079) - (0.01 * (i + 1)),
                lng: (driverLocation?.lng || 79.861244) - (0.01 * (i + 1))
              };
              console.log(`Using fallback restaurant location for ${delivery._id}:`, delivery.pickupLocation);
            }
          } catch (error) {
            console.error(`Error geocoding restaurant address for ${delivery._id}:`, error);
            // Fallback
            delivery.pickupLocation = {
              lat: (driverLocation?.lat || 6.927079) - (0.01 * (i + 1)),
              lng: (driverLocation?.lng || 79.861244) - (0.01 * (i + 1))
            };
          }
        } else if (!delivery.pickupLocation.lat || !delivery.pickupLocation.lng) {
          // No restaurant address but still need pickup location
          delivery.pickupLocation = {
            lat: (driverLocation?.lat || 6.927079) - (0.01 * (i + 1)),
            lng: (driverLocation?.lng || 79.861244) - (0.01 * (i + 1))
          };
          console.log(`No restaurant address, using fallback for ${delivery._id}:`, delivery.pickupLocation);
        }
        
        // Second, check if we have a dropoff address to geocode
        if (delivery.dropoffAddress && (!delivery.dropoffLocation.lat || !delivery.dropoffLocation.lng)) {
          console.log(`Geocoding dropoff address for ${delivery._id}: ${delivery.dropoffAddress}`);
          try {
            const coords = await geocodeAddress(delivery.dropoffAddress, "dropoff");
            if (coords) {
              delivery.dropoffLocation = coords;
              console.log(`Successfully geocoded dropoff address for ${delivery._id}:`, coords);
            } else {
              // Fallback for customer location
              delivery.dropoffLocation = {
                lat: (driverLocation?.lat || 6.927079) + (0.01 * (i + 1)),
                lng: (driverLocation?.lng || 79.861244) + (0.01 * (i + 1))
              };
              console.log(`Using fallback dropoff location for ${delivery._id}:`, delivery.dropoffLocation);
            }
          } catch (error) {
            console.error(`Error geocoding dropoff address for ${delivery._id}:`, error);
            // Fallback
            delivery.dropoffLocation = {
              lat: (driverLocation?.lat || 6.927079) + (0.01 * (i + 1)),
              lng: (driverLocation?.lng || 79.861244) + (0.01 * (i + 1))
            };
          }
        } else if (!delivery.dropoffLocation.lat || !delivery.dropoffLocation.lng) {
          // No dropoff address but still need dropoff location
          delivery.dropoffLocation = {
            lat: (driverLocation?.lat || 6.927079) + (0.01 * (i + 1)),
            lng: (driverLocation?.lng || 79.861244) + (0.01 * (i + 1))
          };
          console.log(`No dropoff address, using fallback for ${delivery._id}:`, delivery.dropoffLocation);
        }
      }
      
      console.log("All geocoding complete, updating state with:", deliveriesWithCoords);
      setDeliveriesWithCoordinates(deliveriesWithCoords);
      setGeocodingComplete(true);
      setLoadingProgress("");
    };
    
    processGeocodingAsync();
    
  }, [activeDeliveries, apiLoaded, driverLocation]);

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
    if (!apiLoaded || !window.google || !selectedDelivery) {
      return;
    }

    // Initialize directionsService if not already done
    if (!directionsService.current) {
      directionsService.current = new window.google.maps.DirectionsService();
    }

    // Make sure we have valid locations
    const hasValidPickup = selectedDelivery.pickupLocation && 
      typeof selectedDelivery.pickupLocation.lat === 'number' && 
      typeof selectedDelivery.pickupLocation.lng === 'number';
    
    const hasValidDropoff = selectedDelivery.dropoffLocation && 
      typeof selectedDelivery.dropoffLocation.lat === 'number' && 
      typeof selectedDelivery.dropoffLocation.lng === 'number';
    
    const hasValidDriver = driverLocation && 
      typeof driverLocation.lat === 'number' && 
      typeof driverLocation.lng === 'number';

    if (!hasValidPickup || !hasValidDropoff || (selectedDelivery.status === 'accepted' && !hasValidDriver)) {
      console.warn("Missing valid locations for directions", {
        hasValidPickup,
        hasValidDropoff,
        hasValidDriver,
        status: selectedDelivery.status
      });
      return;
    }

    try {
      setLoadingProgress("Calculating route...");
      
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
            setLoadingProgress("");
            
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
            setLoadingProgress("");
          }
        }
      );
    } catch (error) {
      console.error("Error calculating directions:", error);
      setDirections(null);
      setLoadingProgress("");
    }
  }, [selectedDelivery, driverLocation, mapInstance, apiLoaded]);

  // Function to handle delivery selection
  const handleDeliverySelection = (deliveryId) => {
    setSelectedDeliveryId(deliveryId);
  };

  // Debug logging
  useEffect(() => {
    console.log("Map render state:", {
      activeDeliveriesCount: activeDeliveries?.length,
      geocodedDeliveriesCount: deliveriesWithCoordinates?.length,
      geocodingComplete,
      driverLocation,
      apiLoaded,
      hasValidDeliveries: deliveriesWithCoordinates?.some(d => 
        d.pickupLocation && d.dropoffLocation && 
        typeof d.pickupLocation.lat === 'number' && 
        typeof d.pickupLocation.lng === 'number' &&
        typeof d.dropoffLocation.lat === 'number' &&
        typeof d.dropoffLocation.lng === 'number'
      )
    });
  }, [activeDeliveries, deliveriesWithCoordinates, geocodingComplete, driverLocation, apiLoaded]);

  if (mapError) {
    return <MapFallback />;
  }
  
  if (!apiKey) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-gray-600 text-center h-full flex items-center justify-center">
        <p>Missing Google Maps API key. Please check your environment variables.</p>
      </div>
    );
  }

  // Show loading while geocoding or waiting for API
  if (!apiLoaded) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-gray-600 text-center h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-2"></div>
          <p>Loading Google Maps API...</p>
        </div>
      </div>
    );
  }

  // Loading state for geocoding
  if (!geocodingComplete && activeDeliveries?.length > 0) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-gray-600 text-center h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-2"></div>
          <p>{loadingProgress || "Processing delivery locations..."}</p>
        </div>
      </div>
    );
  }

  // No deliveries at all
  if (!activeDeliveries || activeDeliveries.length === 0) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-gray-600 text-center h-full flex items-center justify-center">
        <p>No active deliveries to display</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
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

        {/* Deliveries */}
        {deliveriesWithCoordinates.map(delivery => {
          // Skip if not the selected delivery (when one is selected)
          if (selectedDeliveryId && delivery._id !== selectedDeliveryId) {
            return null;
          }

          // Skip if no valid coordinates
          const hasPickupCoords = delivery.pickupLocation && 
            typeof delivery.pickupLocation.lat === 'number' && 
            typeof delivery.pickupLocation.lng === 'number';
          
          const hasDropoffCoords = delivery.dropoffLocation && 
            typeof delivery.dropoffLocation.lat === 'number' && 
            typeof delivery.dropoffLocation.lng === 'number';

          if (!hasPickupCoords && !hasDropoffCoords) {
            console.warn(`Delivery ${delivery._id} has no valid coordinates, skipping render`);
            return null;
          }

          return (
            <React.Fragment key={delivery._id}>
              {/* Restaurant location */}
              {hasPickupCoords && (
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
              {hasDropoffCoords && (
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
              {selectedMarker === `restaurant-${delivery._id}` && hasPickupCoords && (
                <InfoWindow
                  position={delivery.pickupLocation}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2">
                    <p className="font-bold">{delivery.restaurantName || 'Restaurant'}</p>
                    <p className="text-sm">{delivery.restaurantAddress || delivery.pickupAddress || 'Pickup Location'}</p>
                    <p className="text-xs mt-1">Order #{delivery.orderNumber}</p>
                  </div>
                </InfoWindow>
              )}

              {selectedMarker === `customer-${delivery._id}` && hasDropoffCoords && (
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

      {/* Delivery selector overlay */}
      {deliveriesWithCoordinates.length > 1 && (
        <div className="absolute top-4 left-0 right-0 mx-auto w-max">
          <div className="bg-white rounded-lg shadow-lg p-2">
            <select 
              className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDeliveryId || ''}
              onChange={(e) => handleDeliverySelection(e.target.value)}
            >
              <option value="">All Deliveries</option>
              {deliveriesWithCoordinates.map(delivery => (
                <option key={delivery._id} value={delivery._id}>
                  {delivery.restaurantName || 'Restaurant'} - Order #{delivery.orderNumber || 'N/A'}
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