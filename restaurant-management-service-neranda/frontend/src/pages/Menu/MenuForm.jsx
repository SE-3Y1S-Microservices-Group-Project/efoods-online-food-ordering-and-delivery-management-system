import React, { useState } from 'react'
import axios from 'axios'
import { X, Utensils, FileText, ImagePlus, Coins, List, Tag, Clock, Percent } from 'lucide-react'

export default function MenuForm({ onClose, onSuccess, restaurantId }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    tags: '',
    prepTime: '',
    discount: '',
    isAvailable: true,
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      for (let key in formData) {
        data.append(key, formData[key]);
      }
      data.append('restaurantId', restaurantId);
      if (image) data.append('image', image);

      const res = await axios.post('http://localhost:5000/api/menu', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Menu item created successfully!');
      onSuccess(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error creating menu item');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-600">
          <X />
        </button>

        <h2 className="text-2xl font-bold text-sky-700 mb-4 flex items-center">
          <Utensils className="mr-2" /> Add New Menu Item
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <InputWithIcon icon={<Utensils />} name="name" placeholder="Item Name" onChange={handleChange} />
          <InputWithIcon icon={<Coins />} name="price" type="number" placeholder="Price" onChange={handleChange} />
          <InputWithIcon icon={<List />} name="category" placeholder="Category" onChange={handleChange} />
          <InputWithIcon icon={<Percent />} name="discount" type="number" placeholder="Discount %" onChange={handleChange} />
          <InputWithIcon icon={<Clock />} name="prepTime" type="time" placeholder="Prep Time (min)" onChange={handleChange} />
          <InputWithIcon icon={<Tag />} name="tags" placeholder="Tags (comma separated)" onChange={handleChange} />

          <div className="flex items-center border rounded px-2 col-span-2">
            <ImagePlus className="text-gray-400 mr-2" />
            <input
              type="file"
              name="images"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 outline-none"
            />

            {/* To show previews of the images
            {formData.images && formData.images.map((img, i) => (
              <img key={i} src={URL.createObjectURL(img)} className="w-20 h-20 object-cover rounded mr-2" />
            ))} */}

          </div>


          <div className="flex items-start border rounded px-2 col-span-2">
            <FileText className="text-gray-400 mt-2 mr-2" />
            <textarea
              name="description"
              placeholder="Description"
              onChange={handleChange}
              className="w-full p-2 outline-none"
              rows={3}
            ></textarea>
          </div>

          <div className="flex items-center col-span-2 space-x-2">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label className="text-gray-700">Available</label>
          </div>

          <div className="col-span-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-800">
              Submit
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

const InputWithIcon = ({ icon, name, placeholder, onChange, type = 'text' }) => (
  <div className="flex items-center border rounded px-2">
    <span className="text-gray-400 mr-2">{icon}</span>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      className="w-full p-2 outline-none"
      required
    />
  </div>
);