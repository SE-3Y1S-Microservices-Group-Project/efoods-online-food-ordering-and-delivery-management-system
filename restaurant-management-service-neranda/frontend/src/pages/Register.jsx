import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/api/auth/register', form)
      alert('Registration successful! You can now log in.')
      navigate('/login');
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">Register</h2>
        <input name="name" type="text" placeholder="Name" onChange={handleChange} required className="w-full p-2 mb-2 border rounded" />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="w-full p-2 mb-2 border rounded" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="w-full p-2 mb-4 border rounded" />
        <button type="submit" className="bg-sky-600 text-white px-4 py-2 w-full rounded hover:bg-sky-700">Register</button>
      </form>
    </div>
  )
}
