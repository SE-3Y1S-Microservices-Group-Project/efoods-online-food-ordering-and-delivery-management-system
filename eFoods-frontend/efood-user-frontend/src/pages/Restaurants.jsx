import { useEffect, useState } from 'react'
import axios from 'axios'
import RestaurantCard from '../components/RestaurantCard'

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([])

  useEffect(() => {
    axios.get('http://localhost:5000/api/restaurants')
      .then(res => setRestaurants(res.data))
  }, [])

  return (
    <div>
      <div className="p-6 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {restaurants.map(r => <RestaurantCard key={r._id} restaurant={r} />)}
      </div>
    </div>
  )
}
