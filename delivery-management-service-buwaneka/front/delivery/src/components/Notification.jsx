import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Notifications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [earningsData, setEarningsData] = useState(null);

  // Fetch notifications and relevant data from other components
  useEffect(() => {
    // Load active deliveries from localStorage (from ActiveDeliveries component)
    const storedDeliveries = localStorage.getItem('activeDeliveries');
    if (storedDeliveries) {
      try {
        const parsedDeliveries = JSON.parse(storedDeliveries);
        setActiveDeliveries(parsedDeliveries);
      } catch (err) {
        console.error('Failed to parse active deliveries:', err);
      }
    }

    // Load earnings data from localStorage (from EarningsOverview component)
    const storedEarnings = localStorage.getItem('earningsData');
    if (storedEarnings) {
      try {
        const parsedEarnings = JSON.parse(storedEarnings);
        setEarningsData(parsedEarnings);
      } catch (err) {
        console.error('Failed to parse earnings data:', err);
      }
    }

    // Create notifications based on deliveries and earnings
    setTimeout(() => {
      const generatedNotifications = [];
      
      // Add notifications for active deliveries
      if (Array.isArray(activeDeliveries)) {
        activeDeliveries.forEach(delivery => {
          generatedNotifications.push({
            id: `delivery-${delivery._id}`,
            type: 'delivery',
            title: `${delivery.status === 'accepted' ? 'New delivery accepted' : 'Delivery in progress'}`,
            message: `${delivery.restaurantName} - Order #${delivery.orderNumber}`,
            time: new Date().toISOString(),
            read: false
          });
        });
      }
      
      // Add earnings notifications if available
      if (earningsData && earningsData.history && earningsData.history.length > 0) {
        // Get the most recent earnings entry
        const latestEarning = earningsData.history[0];
        generatedNotifications.push({
          id: `earnings-${latestEarning.id || Date.now()}`,
          type: 'payment',
          title: 'Earnings update',
          message: `You've earned LKR ${latestEarning.amount} from your recent deliveries.`,
          time: new Date().toISOString(),
          read: false
        });
      }
      
      // Add system notifications
      generatedNotifications.push({
        id: `system-${Date.now()}`,
        type: 'system',
        title: 'App update available',
        message: 'A new version of the app is available. Please update for improved features.',
        time: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
        read: true
      });
      
      setNotifications(generatedNotifications);
      setLoading(false);
    }, 800);
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const clearAllRead = () => {
    setNotifications(notifications.filter(notification => !notification.read));
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'delivery':
        return <span className="material-icons text-blue-500">local_shipping</span>;
      case 'payment':
        return <span className="material-icons text-green-500">payments</span>;
      case 'system':
        return <span className="material-icons text-purple-500">notifications</span>;
      default:
        return <span className="material-icons text-gray-500">notifications</span>;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'delivery':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'system':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Notifications</h2>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Mark all read
            </button>
          )}
          <button 
            onClick={clearAllRead}
            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Clear read
          </button>
        </div>
      </div>
      
      {/* Simple filter tabs */}
      <div className="mb-4 flex bg-white rounded-lg overflow-hidden shadow p-1">
        <button 
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 ${filter === 'all' ? 'bg-blue-500 text-white font-medium rounded' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          All
          {unreadCount > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => setFilter('unread')}
          className={`flex-1 py-2 ${filter === 'unread' ? 'bg-blue-500 text-white font-medium rounded' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          Unread
        </button>
        {/* <button 
          onClick={() => setFilter('delivery')}
          className={`flex-1 py-2 ${filter === 'delivery' ? 'bg-blue-500 text-white font-medium rounded' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          Deliveries
        </button> */}
        {/* <button 
          onClick={() => setFilter('payment')}
          className={`flex-1 py-2 ${filter === 'payment' ? 'bg-blue-500 text-white font-medium rounded' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          Payments
        </button> */}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {filteredNotifications.length > 0 ? (
            <div className="bg-white rounded-lg shadow">
              <ul className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <li 
                    key={notification.id} 
                    className={`p-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                          <div className="flex items-center text-xs">
                            <span className="text-gray-500 mr-2">{formatTime(notification.time)}</span>
                            <span 
                              className={`px-2 py-0.5 rounded-full ${getTypeColor(notification.type)}`}
                            >
                              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          {notification.message}
                        </div>
                        <div className="mt-2 flex justify-end space-x-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              {/* <span className="material-icons text-gray-400 text-4xl">notifications_off</span> */}
              <p className="mt-2 text-gray-500">
                {filter === 'all' 
                  ? 'No notifications to display.' 
                  : `No ${filter === 'unread' ? 'unread' : filter} notifications to display.`
                }
              </p>
            </div>
          )}
        </>
      )}

      {/* Summary section */}
      {activeDeliveries && activeDeliveries.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Active Deliveries Summary</h3>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm">You have {activeDeliveries.length} active {activeDeliveries.length === 1 ? 'delivery' : 'deliveries'}</p>
            <div className="flex justify-end mt-2">
              <a href="/deliveries" className="text-blue-500 text-sm hover:underline">View details →</a>
            </div>
          </div>
        </div>
      )}

      {earningsData && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Recent Earnings</h3>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings This Month</p>
                <p className="text-lg font-bold text-green-600">LKR {earningsData.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed Deliveries</p>
                <p className="text-lg font-bold">{earningsData.count}</p>
              </div>
            </div>
            {/* <div className="flex justify-end mt-2">
              <a href="/earnings" className="text-blue-500 text-sm hover:underline">View all earnings →</a>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;