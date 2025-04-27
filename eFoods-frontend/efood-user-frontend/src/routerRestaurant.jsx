import { createBrowserRouter } from 'react-router-dom';
import AppUser from './AppUser';

import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Footer from './components/Footer';

import ProtectedRestaurant from './components/auth/ProtectedRestaurant';
import SignInR from './pages/Login'
import SignUpR from './pages/Register'
import ProfileR from './pages/Profile'

const router = createBrowserRouter([
    {
        path: '/rts',
        element: <AppUser />,
        children: [
          { path: 'restaurant-signin', element: <SignInR /> },
          { path: 'restaurant-signup', element: <SignUpR /> },
          {
            path: 'restaurant-profile',
            element: (
              <ProtectedRestaurant>
                  <ProfileR />
              </ProtectedRestaurant>
            ),
          },
        ],
    },
]);

export default router;