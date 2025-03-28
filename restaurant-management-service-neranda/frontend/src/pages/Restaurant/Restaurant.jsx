import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/SideBar'
import axios from 'axios'

export default function Restaurant() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    contact: '',
    description: '',
    image: '', // can be file later
    deliveryFee: '',
    status: 'pending',
  })

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    const res = await axios.get('http://localhost:5000/api/restaurants')
    setRestaurants(res.data)
    setLoading(false)
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/api/restaurants/register', formData)
      setShowForm(false)
      fetchRestaurants()
      alert('Restaurant registered successfully!')
    } catch (error) {
      alert('Failed to create restaurant')
      console.error(error)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-sky-700">All Registered Restaurants</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-900"
          >
            {showForm ? 'Cancel' : 'Create New Restaurant'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6 grid grid-cols-2 gap-4">
            <input className="border p-2" name="name" placeholder="Name" onChange={handleInputChange} required />
            <input className="border p-2" name="email" placeholder="Email" onChange={handleInputChange} required />
            <input className="border p-2" name="address" placeholder="Address" onChange={handleInputChange} required />
            <input className="border p-2" name="password" placeholder="Password" type="password" onChange={handleInputChange} required />
            <input className="border p-2" name="contact" placeholder="Contact" onChange={handleInputChange} required />
            <input className="border p-2" name="deliveryFee" placeholder="Delivery Fee" onChange={handleInputChange} required />
            <input className="border p-2 col-span-2" name="image" placeholder="Image URL" onChange={handleInputChange} />
            <textarea className="border p-2 col-span-2" name="description" placeholder="Description" onChange={handleInputChange}></textarea>
            <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded col-span-2 hover:bg-sky-800">
              Submit
            </button>
          </form>
        )}

        {loading ? (
          <p>Loading...</p>
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
