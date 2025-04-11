import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const navigate = useNavigate()

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/api/auth/register', form)
      alert('Registration successful! You can now log in.')
      navigate('/login')
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-sky-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[25rem] h-[25rem] bg-sky-200 rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[25rem] h-[25rem] bg-green-200 rounded-full blur-3xl opacity-30 animate-pulse" />

      <form onSubmit={handleSubmit} className="relative z-10 bg-white/80 backdrop-blur-md shadow-2xl p-10 rounded-xl w-full max-w-md transition hover:scale-[1.02]">
        <div className="flex items-center justify-center mb-4">
          <UserPlus className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-center text-green-800 mb-6">Register Account</h2>
        <input name="name" type="text" placeholder="Full Name" onChange={handleChange} required className="w-full p-3 mb-3 border border-gray-300 rounded-lg" />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="w-full p-3 mb-3 border border-gray-300 rounded-lg" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="w-full p-3 mb-6 border border-gray-300 rounded-lg" />
        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold shadow">
          Register
        </button>
      </form>
    </div>
  )
}
