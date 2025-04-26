import Driver from '../models/Driver.js';

const driverLocationController = {
  // Update the driver's current location
  updateLocation: async (req, res) => {
    try {
      const { latitude, longitude, timestamp } = req.body;
      const driverId = req.driver._id; // Assuming you have auth middleware that adds driver to req
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }
      
      // Update driver's location in the database
      await Driver.findByIdAndUpdate(driverId, {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude] // GeoJSON format: [longitude, latitude]
        },
        locationUpdatedAt: timestamp || new Date()
      });
      
      return res.status(200).json({ message: 'Location updated successfully' });
    } catch (error) {
      console.error('Error updating driver location:', error);
      return res.status(500).json({ message: 'Server error updating location' });
    }
  },
  
  // Get the driver's current location
  getLocation: async (req, res) => {
    try {
      const driverId = req.params.id;
      
      const driver = await Driver.findById(driverId).select('currentLocation locationUpdatedAt firstName lastName');
      
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
      
      return res.json({
        driverId: driver._id,
        name: `${driver.firstName} ${driver.lastName}`,
        location: driver.currentLocation,
        updatedAt: driver.locationUpdatedAt
      });
    } catch (error) {
      console.error('Error getting driver location:', error);
      return res.status(500).json({ message: 'Server error getting location' });
    }
  },
  
  // Toggle driver's online status
  toggleOnlineStatus: async (req, res) => {
    try {
      const driverId = req.driver._id;
      const { isOnline } = req.body;
      
      if (isOnline === undefined) {
        return res.status(400).json({ message: 'Online status is required' });
      }
      
      const driver = await Driver.findByIdAndUpdate(
        driverId, 
        { isOnline }, 
        { new: true }
      ).select('isOnline');
      
      return res.json({
        isOnline: driver.isOnline
      });
    } catch (error) {
      console.error('Error toggling online status:', error);
      return res.status(500).json({ message: 'Server error updating online status' });
    }
  }
};

export default driverLocationController;