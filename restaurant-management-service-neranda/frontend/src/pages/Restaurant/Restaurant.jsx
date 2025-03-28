import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/SideBar'
import axios from 'axios'
import RegisterForm from './RegisterForm'
import DataTable from 'react-data-table-component'

export default function Restaurant() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterText, setFilterText] = useState('')

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

  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true
    },
    {
      name: 'Contact',
      selector: row => row.contact
    },
    {
      name: 'Status',
      selector: row => row.status
    },
    {
      name: 'Available',
      cell: row => row.isAvailable ? 'Yes' : 'No'
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="space-x-2">
          <button
            onClick={() => editRestaurant(row._id)}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={() => deleteRestaurant(row._id)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true
    }
  ]

  // Optional: filter logic
  const filteredData = restaurants.filter(item =>
    item.name?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.email?.toLowerCase().includes(filterText.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-sky-700">All Registered Restaurants</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900"
          >
            Create New Restaurant
          </button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by name or email..."
          className="mb-4 p-2 border rounded w-full md:w-1/3"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />

        {/* Modal Form */}
        {showForm && (
          <RegisterForm
            onClose={() => setShowForm(false)}
            onSuccess={fetchRestaurants}
          />
        )}

        <div className="bg-white rounded shadow">
          <DataTable
            columns={columns}
            data={filteredData}
            progressPending={loading}
            pagination
            highlightOnHover
            responsive
            striped
          />
        </div>
      </div>
    </div>
  )
}
