// pages/Home.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-sky-700 mb-6">Welcome to eFoods Restaurant System</h1>
      <div className="space-x-4">
        <button
          onClick={() => navigate('/login')}
          className="bg-sky-600 text-white px-6 py-2 rounded hover:bg-sky-800"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/register')}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-800"
        >
          Register
        </button>
      </div>
    </div>
  )
}
