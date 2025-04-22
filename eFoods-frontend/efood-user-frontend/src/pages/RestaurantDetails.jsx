import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export default function RestaurantDetails() {
  const { id } = useParams()
  const [menu, setMenu] = useState([])

  useEffect(() => {
    axios.get(`http://localhost:5000/api/menu?restaurantId=${id}`)
      .then(res => setMenu(res.data))
  }, [id])

  return (
    <div>
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Menu Items</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {menu.map(item => (
            <div key={item._id} className="border rounded-lg overflow-hidden">
              <img src={item.image?.[0] || 'https://via.placeholder.com/300'} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-sm">{item.description}</p>
                <p className="mt-1 font-semibold text-sky-700">Rs. {item.finalPrice}</p>
                <button className="mt-3 bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-800">Order Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
