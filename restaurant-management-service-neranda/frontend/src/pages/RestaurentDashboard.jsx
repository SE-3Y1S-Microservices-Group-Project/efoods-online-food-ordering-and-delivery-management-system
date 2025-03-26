// frontend/src/pages/Dashboard.jsx
import React from 'react'
import { FaUtensils, FaBars, FaSignOutAlt, FaCog, FaHome, FaListAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

export default function RestaurentDashboard() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-center p-4 border-b">
            <FaUtensils className="text-3xl text-sky-600 mr-2" />
            <h1 className="text-xl font-bold text-sky-600">eFoods Admin</h1>
          </div>

          <nav className="mt-4">
            <ul className="space-y-2">
              <li className="p-3 hover:bg-sky-100 flex items-center cursor-pointer">
                <FaHome className="mr-2" /> Dashboard
              </li>
              <li className="p-3 hover:bg-sky-100 flex items-center cursor-pointer">
                <FaListAlt className="mr-2" /> Menu Management
              </li>
              <li className="p-3 hover:bg-sky-100 flex items-center cursor-pointer">
                <FaBars className="mr-2" /> Order Management
              </li>
              <li className="p-3 hover:bg-sky-100 flex items-center cursor-pointer">
                <FaCog className="mr-2" /> Settings
              </li>
            </ul>
          </nav>
        </div>

        <div className="border-t p-4">
          <button onClick={logout} className="w-full flex items-center justify-center bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </div>
      </div>

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
