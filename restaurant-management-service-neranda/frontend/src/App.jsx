import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";
import RestaurentDashboard from './pages/RestaurentDashboard'
import Register from './pages/Register'
import Login from './pages/Login'
import Menu from './pages/Menu'

function App() {
  return (
    <div>
      {/* <h1>Restaurant Management System</h1> */}

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RestaurentDashboard />} />
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/menu" element={<Menu/>} />
        </Routes>
      </BrowserRouter>

    </div>
  )
}

export default App






