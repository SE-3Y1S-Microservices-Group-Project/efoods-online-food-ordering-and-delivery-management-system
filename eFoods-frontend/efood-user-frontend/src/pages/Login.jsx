import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await axios.post('http://localhost:5000/api/users/login', form)
    localStorage.setItem('userToken', res.data.token)
    navigate('/')
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} className="border w-full p-2" required />
        <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} className="border w-full p-2" required />
        <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded">Login</button>
      </form>
    </div>
  )
}
