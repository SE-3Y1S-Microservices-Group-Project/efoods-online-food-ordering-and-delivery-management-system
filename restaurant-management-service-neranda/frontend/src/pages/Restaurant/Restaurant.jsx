import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/SideBar'
import axios from 'axios'
import RegisterForm from './RegisterForm'

export default function Restaurant() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/restaurants')
      setRestaurants(res.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching restaurants:', err)
    }
  }

  const deleteRestaurant = async (id) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      await axios.delete(`http://localhost:5000/api/restaurants/${id}`)
      fetchRestaurants()
    }
  }

  const editRestaurant = (id) => {
    alert(`Edit restaurant with ID: ${id}`)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-sky-700">All Registered Restaurants</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900"
          >
            Create New Restaurant
          </button>
        </div>

        {/* Modal Form */}
        {showForm && (
          <RegisterForm
            onClose={() => setShowForm(false)}
            onSuccess={fetchRestaurants}
          />
        )}

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full table-auto">
              <thead className="bg-sky-600 text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Contact</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Available</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{r.name}</td>
                    <td className="px-4 py-2">{r.email}</td>
                    <td className="px-4 py-2">{r.contact}</td>
                    <td className="px-4 py-2">{r.status}</td>
                    <td className="px-4 py-2">{r.isAvailable ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => editRestaurant(r._id)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteRestaurant(r._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
