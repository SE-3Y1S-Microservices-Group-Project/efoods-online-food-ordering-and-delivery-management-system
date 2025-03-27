import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";
import RestaurentDashboard from './pages/RestaurentDashboard'
import Register from './pages/Register'
import Login from './pages/Login'
import Menu from './pages/Menu'
import NavBar from './components/NavBar'
import Footer from './components/Footer';
import Order from './pages/Order';
import Settings from './pages/Settings';

function App() {
  return (
    <div>
      {/* <h1>Restaurant Management System</h1> */}

      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<RestaurentDashboard />} />
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/menu" element={<Menu/>} />
          <Route path="/order" element={<Order />} />
          <Route path="/setting" element={<Settings />} />
        </Routes>
        <Footer />
      </BrowserRouter>

    </div>
  )
}

export default App






