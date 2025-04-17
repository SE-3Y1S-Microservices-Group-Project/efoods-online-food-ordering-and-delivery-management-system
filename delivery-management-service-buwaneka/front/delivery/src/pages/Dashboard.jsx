import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Profile from './Profile.jsx';
import PendingDeliveries from '../components/PendingDeliveries.jsx';
import ActiveDeliveries from '../components/ActiveDeliveries.jsx';
// Commented out imports for components we're not using yet
// import DeliveryHistory from './DeliveryHistory.jsx';
import EarningsOverview from '../components/EarningsOverview.jsx';
import DeliveryMap from '../components/DeliveryMap.jsx'; // Import the DeliveryMap component
import Notifications from '../components/Notification.jsx';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Sample delivery data for the map
  const sampleDelivery = {
    pickupLocation: { lat: 37.7749, lng: -122.4194 },
    dropoffLocation: { lat: 37.7858, lng: -122.4064 },
    status: 'accepted',
    restaurantName: 'Sample Restaurant',
    customerName: 'John Doe',
    pickupAddress: '123 Market St, San Francisco',
    dropoffAddress: '456 Union St, San Francisco'
  };

  const sampleDriverLocation = { lat: 37.7739, lng: -122.4312 };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'pending':
        return <PendingDeliveries />;
      case 'active':
        return <ActiveDeliveries />;
      case 'earnings':
        return <EarningsOverview />;
      case 'notifications':
        return <Notifications />;
      case 'map': 
        return (
          <div className="p-6">
            {/* <h2 className="text-2xl font-bold mb-6">Live Delivery Map</h2> */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="h-96 w-full border border-gray-300 rounded">
                <DeliveryMap 
                  delivery={sampleDelivery} 
                  driverLocation={sampleDriverLocation}
                />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-700 mb-2">Navigation Instructions</h3>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Current pickup: {sampleDelivery.pickupAddress}</li>
                <li>Destination: {sampleDelivery.dropoffAddress}</li>
                <li>Estimated distance: 1.2 miles</li>
                <li>Estimated time: 8 minutes</li>
              </ul>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Driver Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick stats cards */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-700">Today's Earnings</h3>
                <p className="text-2xl font-bold mt-2">$0.00</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-700">Available Jobs</h3>
                <p className="text-2xl font-bold mt-2">0</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-700">Active Deliveries</h3>
                <p className="text-2xl font-bold mt-2">0</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-700">Weekly Earnings</h3>
                <p className="text-2xl font-bold mt-2">$0.00</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-700">Monthly Deliveries</h3>
                <p className="text-2xl font-bold mt-2">0</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-700">Average Rating</h3>
                <p className="text-2xl font-bold mt-2">0.0</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-700 mb-4">Recent Activity</h3>
                <div className="text-gray-500 text-center py-6">
                  No recent activity to display
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 bg-black text-white">
          <h2 className="text-xl font-bold">e foods</h2>
          <p className="text-sm mt-1">Driver Portal</p>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500">Welcome,</p>
          <p className="font-medium">{user?.firstName} {user?.lastName}</p>
        </div>
        <nav className="mt-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-4 py-2 flex items-center ${activeTab === 'overview' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
          >
            <span className="material-icons mr-3 text-gray-600">Overview</span>
            
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2 flex items-center ${activeTab === 'profile' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
          >
            <span className="material-icons mr-3 text-gray-600">Profile</span>
            
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`w-full text-left px-4 py-2 flex items-center ${activeTab === 'pending' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
          >
            <span className="material-icons mr-3 text-gray-600">Pending Deliveries</span>
            
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            className={`w-full text-left px-4 py-2 flex items-center ${activeTab === 'active' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
          >
            <span className="material-icons mr-3 text-gray-600">Active Deliveries</span>
            
          </button>
          {/* Comment out buttons for features we don't have yet */}
          {/* <button 
            onClick={() => setActiveTab('history')}
            className={`w-full text-left px-4 py-2 flex items-center ${activeTab === 'history' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
          >
            <span className="material-icons mr-3 text-gray-600">history</span>
            Delivery History
          </button> */}
          <button 
            onClick={() => setActiveTab('earnings')}
            className={`w-full text-left px-4 py-2 flex items-center ${activeTab === 'earnings' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
          >
            <span className="material-icons mr-3 text-gray-600">Earnings</span>
            
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`w-full text-left px-4 py-2 flex items-center ${activeTab === 'map' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
          >
            <span className="material-icons mr-3 text-gray-600">Live Map</span>
            
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-2 flex items-center ${activeTab === 'notifications' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
          >
            <span className="material-icons mr-3 text-gray-600">Notifications</span>
            
          </button>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 flex items-center text-red-600 hover:bg-gray-100"
          >
            <span className="material-icons mr-3">Logout</span>
            
          </button>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;