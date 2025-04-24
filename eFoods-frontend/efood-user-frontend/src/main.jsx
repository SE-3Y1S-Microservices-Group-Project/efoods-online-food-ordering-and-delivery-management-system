// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import { BrowserRouter } from 'react-router-dom'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>
// )

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, BrowserRouter } from 'react-router-dom';
import router from './router';
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);