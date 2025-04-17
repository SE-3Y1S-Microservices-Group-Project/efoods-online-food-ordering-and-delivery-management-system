import Driver from '../models/driverModel.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (driver) => {
  return jwt.sign(
    { 
      id: driver._id, 
      email: driver.email 
    }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: '100d' 
    }
  );
};

// CREATE Driver (POST)
export const createDriver = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phoneNumber,
      licenseNumber,
      vehicleType 
    } = req.body;
    
    // Check if driver already exists
    const existingDriver = await Driver.findOne({ 
      $or: [{ email }, { licenseNumber }] 
    });

    if (existingDriver) {
      return res.status(400).json({ 
        message: 'Driver already exists with this email or license number' 
      });
    }

    // Create new driver
    const driver = await Driver.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      licenseNumber,
      vehicleType
    });

    // Generate token
    const token = generateToken(driver);

    res.status(201).json({
      _id: driver._id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      token
    });
  } catch (error) {
    res.status(400).json({ 
      message: 'Error creating driver', 
      error: error.message 
    });
  }
};

// GET All Drivers
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching drivers', 
      error: error.message 
    });
  }
};

// GET Single Driver by ID
export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).select('-password');
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching driver', 
      error: error.message 
    });
  }
};

// UPDATE Driver
export const updateDriver = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      phoneNumber, 
      vehicleType,
      licenseNumber 
    } = req.body;

    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ 
        message: 'Driver not found' 
      });
    }

    // Update fields
    driver.firstName = firstName || driver.firstName;
    driver.lastName = lastName || driver.lastName;
    driver.phoneNumber = phoneNumber || driver.phoneNumber;
    driver.vehicleType = vehicleType || driver.vehicleType;
    driver.licenseNumber = licenseNumber || driver.licenseNumber;

    await driver.save();

    res.json({
      _id: driver._id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      vehicleType: driver.vehicleType,
      licenseNumber: driver.licenseNumber
    });
  } catch (error) {
    res.status(400).json({ 
      message: 'Error updating driver', 
      error: error.message 
    });
  }
};

// DELETE Driver
export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    
    if (!driver) {
      return res.status(404).json({ 
        message: 'Driver not found' 
      });
    }
    
    res.json({ 
      message: 'Driver deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting driver', 
      error: error.message 
    });
  }
};

// Existing authentication methods
export const registerDriver = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phoneNumber, 
      licenseNumber, 
      vehicleType 
    } = req.body;

    // Check if driver already exists
    const existingDriver = await Driver.findOne({ 
      $or: [{ email }, { licenseNumber }] 
    });

    if (existingDriver) {
      return res.status(400).json({ 
        message: 'Driver already exists with this email or license number' 
      });
    }

    // Create new driver
    const driver = await Driver.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      licenseNumber,
      vehicleType
    });

    // Generate token
    const token = generateToken(driver);

    res.status(201).json({
      _id: driver._id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error registering driver', 
      error: error.message 
    });
  }
};

export const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find driver
    const driver = await Driver.findOne({ email });

    if (!driver) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await driver.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(driver);

    res.json({
      _id: driver._id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message 
    });
  }
};

export const getDriverProfile = async (req, res) => {
  try {
    // req.driver is attached by the auth middleware
    const driver = await Driver.findById(req.driver.id).select('-password');

    if (!driver) {
      return res.status(404).json({ 
        message: 'Driver not found' 
      });
    }

    res.json(driver);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching driver profile', 
      error: error.message 
    });
  }
};

export const updateDriverProfile = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      phoneNumber, 
      vehicleType 
    } = req.body;

    const driver = await Driver.findById(req.driver.id);

    if (!driver) {
      return res.status(404).json({ 
        message: 'Driver not found' 
      });
    }

    // Update fields
    driver.firstName = firstName || driver.firstName;
    driver.lastName = lastName || driver.lastName;
    driver.phoneNumber = phoneNumber || driver.phoneNumber;
    driver.vehicleType = vehicleType || driver.vehicleType;

    await driver.save();

    res.json({
      _id: driver._id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      vehicleType: driver.vehicleType
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating driver profile', 
      error: error.message 
    });
  }
};