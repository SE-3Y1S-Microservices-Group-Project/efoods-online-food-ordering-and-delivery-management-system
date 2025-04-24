import { createBrowserRouter } from 'react-router-dom';
import AppUser from './AppUser';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Restaurants from './pages/Restaurants';
import RestaurantDetails from './pages/RestaurantDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProtectedRoute from './components/auth/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppUser />,
    children: [
      { path: 'signin', element: <SignIn /> },
      { path: 'signup', element: <SignUp /> },
      {
        path: 'restaurants',
        element: (
          <ProtectedRoute>
            <Restaurants />
          </ProtectedRoute>
        ),
      },
      {
        path: 'restaurants/:id',
        element: (
          <ProtectedRoute>
            <RestaurantDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;