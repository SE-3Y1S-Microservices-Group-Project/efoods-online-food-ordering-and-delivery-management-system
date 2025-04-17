import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { useAuth } from '../context/AuthContext.jsx';

const vehicleTypes = ['Motorcycle', 'Car', 'Van', 'Truck'];

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    licenseNumber: '',
    vehicleType: ''
  });
  const [originalProfileData, setOriginalProfileData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { 
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const profileResponse = await authService.getProfile(token);
        const fetchedProfileData = {
          firstName: profileResponse.firstName,
          lastName: profileResponse.lastName,
          email: profileResponse.email,
          phoneNumber: profileResponse.phoneNumber,
          licenseNumber: profileResponse.licenseNumber,
          vehicleType: profileResponse.vehicleType
        };
        
        // Only update if not currently editing
        if (!isEditing) {
          setProfileData(fetchedProfileData);
          setOriginalProfileData(fetchedProfileData);
        }
      } catch (err) {
        setError(err.message);
        logout();
        navigate('/login');
      }
    };

    fetchProfile();
  }, [navigate, logout, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updatedProfile = await authService.updateProfile(token, profileData);
      setProfileData(updatedProfile);
      setOriginalProfileData(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedProfile = await authService.updateProfile(token, profileData);
      setProfileData(updatedProfile);
      setOriginalProfileData(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    // Revert to original data when canceling
    setProfileData(originalProfileData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">
            Driver Profile
          </h2>
          <button 
            onClick={handleLogout}
            className="bg-red-300 text-black px-4 py-2 rounded-md hover:bg-red-500 hover:text-white"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              ) : (
                <p className="mt-1 text-gray-900">{profileData.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              ) : (
                <p className="mt-1 text-gray-900">{profileData.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{profileData.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                name="phoneNumber"
                value={profileData.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            ) : (
              <p className="mt-1 text-gray-900">{profileData.phoneNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">License Number</label>
            {isEditing ? (
              <input
                type="text"
                name="licenseNumber"
                value={profileData.licenseNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            ) : (
              <p className="mt-1 text-gray-900">{profileData.licenseNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
            {isEditing ? (
              <select
                name="vehicleType"
                value={profileData.vehicleType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              >
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            ) : (
              <p className="mt-1 text-gray-900">{profileData.vehicleType}</p>
            )}
          </div>
        </form>

        <div className="flex space-x-4 mt-10">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="w-1/2 bg-black text-white py-2 rounded-md hover:bg-[rgba(0,0,0,0.8)]"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-1/2 bg-red-300 text-gray-700 py-2 rounded-md hover:bg-red-500 hover:text-white"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full bg-black text-white py-2 rounded-md hover:bg-[rgba(0,0,0,0.8)]"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;