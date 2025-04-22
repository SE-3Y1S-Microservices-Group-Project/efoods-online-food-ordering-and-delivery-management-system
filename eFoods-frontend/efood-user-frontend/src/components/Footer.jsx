import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* About */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">🍽️ eFood</h3>
          <p className="text-sm">
            eFood connects food lovers with delicious restaurants, delivered right to your door.
          </p>
          <p className="mt-3 text-sm">Enjoy fast, affordable, and reliable food delivery services across Sri Lanka.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/restaurants" className="hover:underline">Restaurants</Link></li>
            <li><Link to="/login" className="hover:underline">Login</Link></li>
            <li><Link to="/register" className="hover:underline">Register</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            <li>Email: <a href="mailto:support@efood.lk" className="hover:underline">support@efood.lk</a></li>
            <li>Phone: +94 71 234 5678</li>
            <li>FAQs</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="text-white font-semibold mb-3">Follow Us</h4>
          <div className="flex space-x-4 mt-2">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <Facebook size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <Instagram size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <Twitter size={20} />
            </a>
            <a href="mailto:support@efood.lk" className="hover:text-white">
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-800 mt-10 pt-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} eFood. All rights reserved.
      </div>
    </footer>
  );
}
