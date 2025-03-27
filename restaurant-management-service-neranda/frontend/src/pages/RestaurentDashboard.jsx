// frontend/src/pages/RestaurentDashboard.jsx
import React from 'react'
import Sidebar from '../components/SideBar'

export default function RestaurentDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
    
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-4xl font-bold text-sky-700 mb-4">Restaurant Dashboard</h1>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold">Today Orders</h2>
            <p className="text-3xl font-bold mt-2 text-sky-600">12</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold">Total Revenue</h2>
            <p className="text-3xl font-bold mt-2 text-green-600">LKR 45,000</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold">Status</h2>
            <p className="text-lg font-medium mt-2 text-yellow-600">Pending Approval</p>
          </div>
        </div>
      </div>
    </div>
  )
}
