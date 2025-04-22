import { Link } from 'react-router-dom'

export default function RestaurantCard({ restaurant }) {
  return (
    <div className="border rounded shadow hover:shadow-lg transition">
      <img src={restaurant.image?.[0] || 'https://via.placeholder.com/300'} className="h-40 w-full object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold">{restaurant.name}</h3>
        <p className="text-sm text-gray-500">{restaurant.address}</p>
        <Link to={`/restaurants/${restaurant._id}`} className="mt-2 inline-block text-sky-600 hover:underline text-sm">View Menu →</Link>
      </div>
    </div>
  )
}
