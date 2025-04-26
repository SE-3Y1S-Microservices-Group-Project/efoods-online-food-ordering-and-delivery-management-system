import axios from 'axios';

const locationService = {
  // Update driver location on the server
  updateDriverLocation: async (location) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        '/api/drivers/location',
        { 
          latitude: location.lat,
          longitude: location.lng,
          timestamp: location.timestamp
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  },

  // Get geocoded location from address
  getGeocodedLocation: async (address) => {
    try {
      const response = await axios.get(
        `/api/geocode?address=${encodeURIComponent(address)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }
};

export default locationService;