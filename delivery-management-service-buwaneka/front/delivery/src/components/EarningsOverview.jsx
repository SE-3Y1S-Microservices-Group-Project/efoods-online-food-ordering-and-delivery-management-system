import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const EarningsOverview = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    total: 0,
    deliveries: 0,
    tips: 0,
    bonuses: 0,
    average: 0,
    history: []
  });

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockEarnings = {
        week: {
          total: 346.75,
          deliveries: 189.50,
          tips: 132.25,
          bonuses: 25.00,
          average: 19.26,
          history: [
            { id: 1, date: '2025-04-10', amount: 78.50, deliveries: 4, status: 'Paid' },
            { id: 2, date: '2025-04-09', amount: 93.25, deliveries: 5, status: 'Paid' },
            { id: 3, date: '2025-04-08', amount: 65.50, deliveries: 3, status: 'Paid' },
            { id: 4, date: '2025-04-07', amount: 109.50, deliveries: 6, status: 'Paid' }
          ]
        },
        month: {
          total: 1286.25,
          deliveries: 725.50,
          tips: 435.75,
          bonuses: 125.00,
          average: 18.38,
          history: [
            { id: 5, date: '2025-04-03', amount: 342.50, deliveries: 18, status: 'Paid' },
            { id: 6, date: '2025-03-27', amount: 315.25, deliveries: 17, status: 'Paid' },
            { id: 7, date: '2025-03-20', amount: 289.50, deliveries: 16, status: 'Paid' },
            { id: 8, date: '2025-03-13', amount: 339.00, deliveries: 19, status: 'Paid' }
          ]
        },
        year: {
          total: 12568.75,
          deliveries: 7150.50,
          tips: 4218.25,
          bonuses: 1200.00,
          average: 17.95,
          history: [
            { id: 9, date: '2025-04', amount: 1286.25, deliveries: 70, status: 'Paid' },
            { id: 10, date: '2025-03', amount: 1352.50, deliveries: 74, status: 'Paid' },
            { id: 11, date: '2025-02', amount: 1125.75, deliveries: 63, status: 'Paid' },
            { id: 12, date: '2025-01', amount: 1195.25, deliveries: 67, status: 'Paid' }
          ]
        }
      };
      
      setEarnings(mockEarnings[period]);
      setLoading(false);
    }, 800);
  }, [period]);

  const handlePeriodChange = (newPeriod) => {
    setLoading(true);
    setPeriod(newPeriod);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    // For year period, only the month is provided
    if (dateString.length <= 7) {
      const [year, month] = dateString.split('-');
      const date = new Date(year, month - 1);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Earnings Overview</h2>
      
      {/* Period selector */}
      <div className="mb-6 flex bg-white rounded-lg overflow-hidden shadow p-1">
        <button 
          onClick={() => handlePeriodChange('week')}
          className={`flex-1 py-2 px-4 ${period === 'week' ? 'bg-blue-500 text-white font-medium rounded' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          This Week
        </button>
        <button 
          onClick={() => handlePeriodChange('month')}
          className={`flex-1 py-2 px-4 ${period === 'month' ? 'bg-blue-500 text-white font-medium rounded' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          This Month
        </button>
        <button 
          onClick={() => handlePeriodChange('year')}
          className={`flex-1 py-2 px-4 ${period === 'year' ? 'bg-blue-500 text-white font-medium rounded' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          This Year
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Earnings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Total Earnings</h3>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(earnings.total)}</p>
              <div className="mt-4 text-sm text-gray-500">
                {period === 'week' ? 'This week' : period === 'month' ? 'This month' : 'This year'}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Average Per Delivery</h3>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(earnings.average)}</p>
              <div className="mt-4 text-sm text-gray-500">
                Before platform fees
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Tips</h3>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(earnings.tips)}</p>
              <div className="mt-4 text-sm text-gray-500">
                {((earnings.tips / earnings.total) * 100).toFixed(1)}% of total earnings
              </div>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
            <h3 className="text-lg font-medium p-4 border-b">Earnings Breakdown</h3>
            <div className="p-6">
              <div className="flex mb-4">
                <div className="w-1/3">
                  <div className="text-sm text-gray-500">Delivery Pay</div>
                  <div className="text-xl font-medium mt-1">{formatCurrency(earnings.deliveries)}</div>
                </div>
                <div className="w-1/3">
                  <div className="text-sm text-gray-500">Tips</div>
                  <div className="text-xl font-medium mt-1">{formatCurrency(earnings.tips)}</div>
                </div>
                <div className="w-1/3">
                  <div className="text-sm text-gray-500">Bonuses</div>
                  <div className="text-xl font-medium mt-1">{formatCurrency(earnings.bonuses)}</div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-4 flex rounded-full bg-gray-200">
                    <div 
                      style={{ width: `${(earnings.deliveries / earnings.total) * 100}%` }}
                      className="bg-blue-500 h-full"
                    ></div>
                    <div 
                      style={{ width: `${(earnings.tips / earnings.total) * 100}%` }}
                      className="bg-purple-500 h-full"
                    ></div>
                    <div 
                      style={{ width: `${(earnings.bonuses / earnings.total) * 100}%` }}
                      className="bg-green-500 h-full"
                    ></div>
                  </div>
                </div>
                <div className="flex text-xs mt-2 justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-blue-500 rounded-full mr-1"></div>
                    <span>Delivery Pay ({((earnings.deliveries / earnings.total) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-purple-500 rounded-full mr-1"></div>
                    <span>Tips ({((earnings.tips / earnings.total) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-500 rounded-full mr-1"></div>
                    <span>Bonuses ({((earnings.bonuses / earnings.total) * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h3 className="text-lg font-medium p-4 border-b flex justify-between items-center">
              <span>Payment History</span>
              <a href="#" className="text-sm text-blue-500 hover:underline">View All</a>
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deliveries
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {earnings.history.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.deliveries}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {earnings.history.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                No payment history available for this period
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EarningsOverview;