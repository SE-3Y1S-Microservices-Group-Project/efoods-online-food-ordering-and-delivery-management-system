import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div>
      <section className="text-center py-20 bg-green-50">
        <h1 className="text-4xl font-bold mb-4">Welcome to eFood</h1>
        <p className="mb-6">Order from your favorite restaurants, all in one place.</p>
        <Link to="/restaurants" className="bg-sky-600 text-white px-4 py-2 rounded">Browse Restaurants</Link>
      </section>

      <section id="about" className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">About Us</h2>
        <p className="text-gray-600">We connect food lovers with delicious restaurants, right at your fingertips.</p>
      </section>

      <section id="contact" className="p-8 text-center bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
        <p>Email: support@efood.lk</p>
        <p>Phone: +94 71 234 5678</p>
      </section>

    </div>
  )
}
