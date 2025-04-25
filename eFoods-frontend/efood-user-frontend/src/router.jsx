import { createBrowserRouter } from 'react-router-dom';
import AppUser from './AppUser';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Restaurants from './pages/Restaurants';
import RestaurantDetails from './pages/RestaurantDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserNavBar from './components/userNavBar';
import Home from './pages/Home';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppUser />,
    children: [
      { path: '', element: <Home /> },
      { path: 'signin', element: <SignIn /> },
      { path: 'signup', element: <SignUp /> },
      {
        path: 'restaurants',
        element: (
          <ProtectedRoute>
            <UserNavBar />
              <Restaurants />
          </ProtectedRoute>
        ),
      },
      {
        path: 'restaurants/:id',
        element: (
          <ProtectedRoute>
            <UserNavBar />
              <RestaurantDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <UserNavBar />
              <Cart />
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <UserNavBar />
              <Checkout />
          </ProtectedRoute>
        ),
      },
    ],
  },

  {
    path: '/rts',
    element: <AppUser />,
    children: [
      { path: 'signin', element: <SignIn /> },
      { path: 'signup', element: <SignUp /> },
      {
        path: 'restaurants',
        element: (
          <ProtectedRoute>
            <UserNavBar />
              <Restaurants />
          </ProtectedRoute>
        ),
      },
      {
        path: 'restaurants/:id',
        element: (
          <ProtectedRoute>
            <UserNavBar />
              <RestaurantDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <UserNavBar />
              <Cart />
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <UserNavBar />
              <Checkout />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;