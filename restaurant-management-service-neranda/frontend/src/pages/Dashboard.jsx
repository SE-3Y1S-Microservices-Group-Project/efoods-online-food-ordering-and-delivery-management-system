import React, { useEffect, useState } from 'react';
import Sidebar from '../components/SideBar';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    menuCount: 0,
    customerCount: 0,
  });

  const [revenueByDay, setRevenueByDay] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/dashboard/stats'); // Make sure this exists
      setStats(res.data.stats);
      setRevenueByDay(res.data.revenueByDay);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  };

  const barChartData = {
    labels: revenueByDay.map(day => day.date),
    datasets: [
      {
        label: 'Revenue (LKR)',
        data: revenueByDay.map(day => day.amount),
        backgroundColor: 'rgba(14, 165, 233, 0.6)',
        borderRadius: 6
      }
    ]
  };

  const doughnutData = {
    labels: ['Completed', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [40, 25, 10], // Sample data
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        hoverOffset: 4
      }
    ]
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-4xl font-bold text-sky-700 mb-6">Dashboard Overview</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <StatCard title="Today's Orders" value={stats.todayOrders} color="text-sky-600" />
          <StatCard title="Total Revenue" value={`LKR ${stats.totalRevenue}`} color="text-green-600" />
          <StatCard title="Pending Orders" value={stats.pendingOrders} color="text-yellow-600" />
          <StatCard title="Menu Items" value={stats.menuCount} color="text-indigo-600" />
          <StatCard title="Customers" value={stats.customerCount} color="text-purple-600" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4 text-sky-800">Revenue - Last 7 Days</h2>
            <Bar data={barChartData} />
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4 text-sky-800">Order Status Distribution</h2>
            <Doughnut data={doughnutData} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
      <h2 className="text-lg font-medium text-gray-700">{title}</h2>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}
