import React from 'react'
import Sidebar from '../components/SideBar'

export default function Restaurant() {
  return (
    <div className="flex min-h-screen bg-gray-100">
    
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-4xl font-bold text-sky-700 mb-4">Restaurant Section</h1>
      </div>

    </div>
  )
}

