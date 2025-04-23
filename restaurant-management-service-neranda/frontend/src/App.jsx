import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from 'react';

import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';

import Register from './pages/Register';
import Login from './pages/Login';
import Menu from './pages/Menu/Menu';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
// import Order from './pages/Order/Order';
import Settings from './pages/Settings';
import Restaurant from './pages/Restaurant/Restaurant';
import RestaurantEditForm from './pages/Restaurant/RestaurantEditForm';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isLogin = location.pathname === '/login';
  const isRegister = location.pathname === '/register';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div>
      {!isHomePage && !isLogin && !isRegister && <NavBar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/restaurant" element={<Restaurant />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/menu" element={<Menu />} />
        {/* <Route path="/order" element={<Order />} /> */}
        <Route path="/setting" element={<Settings />} />
        <Route path="/restaurant/edit/:id" element={<RestaurantEditForm />} />
      </Routes>

      {!isHomePage && !isLogin && !isRegister && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
