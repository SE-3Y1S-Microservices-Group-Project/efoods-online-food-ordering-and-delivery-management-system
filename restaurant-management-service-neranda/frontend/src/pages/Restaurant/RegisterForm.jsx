import React, { useState } from 'react'
import axios from 'axios'
import {
  X, Store, Mail, MapPin, Lock, Phone,
  FileText, ImagePlus, Coins
} from 'lucide-react'

export default function RegisterForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    contact: '',
    description: '',
    deliveryFee: '',
    status: 'pending',
  })

  const [images, setImages] = useState([])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    setImages([...e.target.files])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = new FormData()
      for (let key in formData) {
        data.append(key, formData[key])
      }
      images.forEach((file) => {
        data.append('images', file)
      })

      await axios.post('http://localhost:5000/api/restaurants', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      alert('Restaurant registered successfully!')
      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
      alert('Error registering restaurant')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-600">
          <X />
        </button>

        <h2 className="text-2xl font-bold text-sky-700 mb-4 flex items-center">
          <Store className="mr-2" /> Register New Restaurant
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="flex items-center border rounded px-2">
            <Store className="text-gray-400 mr-2" />
            <input name="name" placeholder="Name" onChange={handleChange} className="w-full p-2 outline-none" required />
          </div>

          <div className="flex items-center border rounded px-2">
            <Mail className="text-gray-400 mr-2" />
            <input name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 outline-none" required />
          </div>

          <div className="flex items-center border rounded px-2">
            <Phone className="text-gray-400 mr-2" />
            <input name="contact" placeholder="Contact" onChange={handleChange} className="w-full p-2 outline-none" required />
          </div>

          <div className="flex items-center border rounded px-2">
            <Lock className="text-gray-400 mr-2" />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full p-2 outline-none" required />
          </div>

          <div className="flex items-center border rounded px-2 col-span-2">
            <MapPin className="text-gray-400 mr-2" />
            <input name="address" placeholder="Full Address" onChange={handleChange} className="w-full p-2 outline-none" required />
          </div>

          <div className="flex items-center border rounded px-2">
            <Coins className="text-gray-400 mr-2" />
            <input name="deliveryFee" placeholder="Delivery Fee" onChange={handleChange} className="w-full p-2 outline-none" required />
          </div>

          <div className="flex items-center border rounded px-2 col-span-2">
            <ImagePlus className="text-gray-400 mr-2" />
            <input type="file" name="images" onChange={handleFileChange} multiple className="w-full p-2 outline-none" />
          </div>

          <div className="flex items-start border rounded px-2 col-span-2">
            <FileText className="text-gray-400 mt-2 mr-2" />
            <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full p-2 outline-none" rows={3}></textarea>
          </div>

          <div className="col-span-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-800">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
