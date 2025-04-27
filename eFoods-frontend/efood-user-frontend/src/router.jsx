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
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Footer from './components/Footer';


// 👇 Stripe
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PlaceOrder from './pages/PlaceOrder';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import UserProfile from './pages/UserProfile';

const stripePromise = loadStripe('pk_test_51RGxa9QwYkP7b05Rhk7zOc5FqNp2go8wELiqw6sFbpK874upT4hV3crf94pDEYHSi6YHdaGXuKJH0JXR3fjB8pxI00fTmS611t');

// 👇 Wrapper component to provide Stripe Elements context
const StripeWrapper = ({ children }) => (
  <Elements stripe={stripePromise}>{children}</Elements>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppUser />,
    children: [
      { path: '', element: <Home /> },
      { path: 'aboutus', element: <AboutUs /> },
      { path: 'contactus', element: <ContactUs /> },
      { path: 'signin', element: <SignIn /> },
      { path: 'signup', element: <SignUp /> },
      {
        path: 'restaurants',
        element: (
          <ProtectedRoute>
            <UserNavBar />
              <Restaurants />
            <Footer />
          </ProtectedRoute>
        ),
      },
      {
        path: 'restaurants/:id',
        element: (
          <ProtectedRoute>
            <UserNavBar />
              <RestaurantDetails />
            <Footer />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <UserNavBar />
              <Cart />
            <Footer />
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <UserNavBar />
              <Checkout />
            <Footer />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile-my',
        element: (
          <ProtectedRoute>
            <UserNavBar />
              <UserProfile />
            <Footer />
          </ProtectedRoute>
        ),
      },
       // 👇 Stripe-related routes wrapped in Elements
      {
        path: 'placeorder',
        element: (
          <ProtectedRoute>
            <StripeWrapper>
              <PlaceOrder />
            </StripeWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'payment-success',
        element: (
          <ProtectedRoute>
            <StripeWrapper>
              <PaymentSuccess />
            </StripeWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'payment-failed',
        element: (
          <ProtectedRoute>
            <StripeWrapper>
              <PaymentFailed />
            </StripeWrapper>
          </ProtectedRoute>
        ),
      },

    ],
  },
]);

export default router;