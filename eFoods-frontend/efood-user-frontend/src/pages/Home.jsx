import { Link } from 'react-router-dom';
import {
  MapPin, Star, Timer, Percent, Phone, Mail, ThumbsUp, Smartphone,
  ShoppingCart, Truck, HeartHandshake, Receipt, BellRing
} from 'lucide-react';

export default function Home() {
  return (
    <div className="font-sans text-gray-800">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-200 to-green-50 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-green-800 mb-4">Delicious Food Delivered Fast</h1>
        <p className="text-gray-700 text-lg mb-6">Experience the best food delivery from your favorite local restaurants</p>
        <Link to="/restaurants" className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold shadow">
          🍽️ Browse Restaurants
        </Link>
      </section>

      {/* Popular / Featured Section */}
      <section className="py-14 bg-white px-6">
        <h2 className="text-3xl font-bold mb-8 text-center flex justify-center items-center"><Star className="mr-2" /> Featured Restaurants & Dishes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Sample Cards */}
          <FeaturedCard name="Sushi Heaven" dish="Dragon Roll" rating={4.9} />
          <FeaturedCard name="Burger Yard" dish="Cheese Blast" rating={4.7} />
          <FeaturedCard name="Pizza Bros" dish="Pepperoni Classic" rating={4.6} />
        </div>
      </section>

      {/* Live Driver Tracking Preview */}
      <section className="py-14 bg-gray-50 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4 flex justify-center items-center"><Truck className="mr-2" /> Live Driver Tracking</h2>
        <p className="mb-4">Track your order in real-time and get notified when it’s at your door!</p>
        <img src="/images/driver-tracking-preview.png" alt="Driver tracking" className="mx-auto w-full max-w-xl rounded shadow" />
      </section>

      {/* Categories */}
      <section className="py-14 px-6">
        <h2 className="text-3xl font-bold mb-6 text-center flex justify-center items-center"><ShoppingCart className="mr-2" /> Browse by Cuisine</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {['Chinese', 'Pizza', 'Burgers', 'Vegan', 'Desserts', 'Sri Lankan'].map((category, i) => (
            <button key={i} className="bg-green-100 hover:bg-green-300 px-4 py-2 rounded-full font-medium shadow">
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Top Rated / Nearby Restaurants */}
      <section className="py-14 bg-gray-100 px-6">
        <h2 className="text-3xl font-bold mb-6 text-center flex justify-center items-center"><MapPin className="mr-2" /> Top Rated Near You</h2>
        <div className="flex justify-center gap-6 flex-wrap">
          <TopRatedCard name="Green Curry Point" rating={5.0} delivery="20 min" />
          <TopRatedCard name="Kottu Hut" rating={4.8} delivery="15 min" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 px-6 bg-white">
        <h2 className="text-3xl font-bold mb-6 text-center flex justify-center items-center"><ThumbsUp className="mr-2" /> Happy Customers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <Testimonial text="Absolutely amazing food and super-fast delivery!" name="Dinithi S." />
          <Testimonial text="I love how easy it is to use this app!" name="Kavindu R." />
        </div>
      </section>

      {/* Real-Time Order Tracker */}
      <section className="py-14 bg-green-50 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4 flex justify-center items-center"><Receipt className="mr-2" /> Real-Time Order Tracker</h2>
        <p>Check your order status and view delivery updates in real-time.</p>
        <Link to="/profile" className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded shadow">📦 View Orders</Link>
      </section>

      {/* Promotions & Offers */}
      <section className="py-14 px-6 bg-yellow-50 text-center">
        <h2 className="text-3xl font-bold mb-6 flex justify-center items-center"><Percent className="mr-2" /> Special Offers</h2>
        <div className="flex justify-center gap-4 flex-wrap">
          <OfferCard text="🔥 20% OFF for new users!" />
          <OfferCard text="🎉 Free delivery on weekends!" />
        </div>
      </section>

      {/* Mobile App Promo */}
      <section className="py-14 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold mb-4 flex justify-center items-center"><Smartphone className="mr-2" /> Download Our App</h2>
        <p className="mb-6">Order food on the go with our mobile app</p>
        <div className="flex justify-center gap-4">
          <a href="#"><img src="/images/playstore.png" alt="Play Store" className="h-12" /></a>
          <a href="#"><img src="/images/appstore.png" alt="App Store" className="h-12" /></a>
        </div>
      </section>

      {/* Newsletter / Subscription */}
      <section className="py-14 bg-gray-800 text-white text-center px-6">
        <h2 className="text-3xl font-bold mb-4 flex justify-center items-center"><BellRing className="mr-2" /> Stay Updated!</h2>
        <p className="mb-6">Sign up for promotions, updates and alerts from your favorite places.</p>
        <form className="flex flex-col sm:flex-row justify-center gap-2">
          <input type="email" placeholder="Your email" className="px-4 py-2 rounded text-black" />
          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold">Subscribe</button>
        </form>
      </section>

      {/* Contact / Footer (if not already in layout) */}
      <section className="py-10 text-center bg-gray-100">
        <h3 className="text-xl font-bold mb-2">Contact Us</h3>
        <p className="text-gray-700 flex justify-center items-center gap-2"><Phone size={18} /> +94 71 234 5678</p>
        <p className="text-gray-700 flex justify-center items-center gap-2"><Mail size={18} /> support@efood.lk</p>
      </section>
    </div>
  );
}

const FeaturedCard = ({ name, dish, rating }) => (
  <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition">
    <h3 className="font-bold text-lg">{name}</h3>
    <p className="text-gray-600">{dish}</p>
    <p className="text-yellow-600 mt-1">⭐ {rating}</p>
  </div>
);

const TopRatedCard = ({ name, rating, delivery }) => (
  <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-md">
    <h3 className="font-semibold text-lg">{name}</h3>
    <div className="flex items-center gap-3 text-sm mt-2">
      <Star className="text-yellow-500" size={16} /> {rating}
      <Timer className="text-sky-500" size={16} /> {delivery}
    </div>
  </div>
);

const Testimonial = ({ text, name }) => (
  <div className="bg-gray-50 p-4 rounded shadow-sm">
    <p className="italic text-gray-600 mb-2">"{text}"</p>
    <p className="font-semibold text-gray-800">- {name}</p>
  </div>
);

const OfferCard = ({ text }) => (
  <div className="bg-white border border-yellow-300 rounded-lg px-6 py-4 text-yellow-700 font-semibold shadow-sm hover:shadow-md">
    {text}
  </div>
);
