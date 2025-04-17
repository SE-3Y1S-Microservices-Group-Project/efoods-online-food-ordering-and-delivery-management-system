import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  X, Store, Mail, Lock, Phone, FileText, ImagePlus, Coins
} from 'lucide-react'

import { Country, State, City } from 'country-state-city'
import { useNavigate } from 'react-router-dom';


export default function RestaurantEditForm({ onClose, onSuccess }) {

    const navigate = useNavigate();


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contact: '',
    description: '',
    deliveryFee: '',
    status: '',
  });

  const [existingImage, setExistingImage] = useState([]);
  const [images, setImages] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  useEffect(() => {
    setCountryList(Country.getAllCountries());
    fetchRestaurantDetails();
  }, []);

  const fetchRestaurantDetails = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/restaurants/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const rest = res.data;
      setFormData({
        name: rest.name,
        email: rest.email,
        contact: rest.contact,
        description: rest.description,
        deliveryFee: rest.deliveryFee,
        status: rest.status,
        password: '',
      });

      if (rest.address) {
        const [city, state, country] = rest.address.split(',').map(s => s.trim());
        setSelectedCountry(country);
        setSelectedState(state);
        setSelectedCity(city);
      }

      setExistingImage(rest.image || []);
    } catch (err) {
      console.error('Failed to fetch restaurant:', err);
    }
  };

  useEffect(() => {
    if (selectedCountry) {
      const states = State.getStatesOfCountry(selectedCountry);
      setStateList(states);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      const cities = City.getCitiesOfState(selectedCountry, selectedState);
      setCityList(cities);
    }
  }, [selectedState]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      for (let key in formData) {
        if (formData[key] || key === 'password') {
          data.append(key, formData[key]);
        }
      }

      data.append('address', `${selectedCity}, ${selectedState}, ${selectedCountry}`);
      images.forEach(file => data.append('images', file));

      await axios.put('http://localhost:5000/api/restaurants/update', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Restaurant updated successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error updating restaurant');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative animate-fadeIn overflow-y-auto max-h-[90vh]">
        <button
            onClick={() => navigate('/restaurant')}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
            >
            <X />
        </button>

        <h2 className="text-2xl font-bold text-sky-700 mb-4 flex items-center">
          <Store className="mr-2" /> Edit Restaurant Details
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <InputWithIcon icon={<Store />} name="name" value={formData.name} onChange={handleChange} />
          <InputWithIcon icon={<Mail />} name="email" value={formData.email} onChange={handleChange} />
          <InputWithIcon icon={<Phone />} name="contact" value={formData.contact} onChange={handleChange} />
          <InputWithIcon icon={<Lock />} name="password" value={formData.password} onChange={handleChange} type="password" placeholder="Leave blank to keep current" />

          {/* Location */}
          <div className="col-span-1">
            <label className="block mb-1 text-sm font-semibold">Country</label>
            <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Select Country</option>
              {countryList.map(c => (
                <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="block mb-1 text-sm font-semibold">State</label>
            <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Select State</option>
              {stateList.map(s => (
                <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block mb-1 text-sm font-semibold">City</label>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Select City</option>
              {cityList.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <InputWithIcon icon={<Coins />} name="deliveryFee" value={formData.deliveryFee} onChange={handleChange} placeholder="Delivery Fee (LKR)" type="number" />

          <div className="col-span-2">
            <label className="block mb-1 text-sm font-semibold">Current Images</label>
            <div className="flex gap-2 flex-wrap">
              {existingImage.map((img, i) => (
                <img key={i} src={img} alt={`existing-${i}`} className="h-20 w-20 object-cover rounded border" />
              ))}
            </div>
          </div>

          <div className="col-span-2 flex items-center border rounded px-3 py-2">
            <ImagePlus className="text-gray-400 mr-2" />
            <input type="file" name="images" multiple onChange={handleFileChange} className="w-full outline-none" />
          </div>

          <div className="flex items-start border rounded px-2 col-span-2">
            <FileText className="text-gray-400 mt-2 mr-2" />
            <textarea
              name="description"
              value={formData.description}
              placeholder="Description"
              onChange={handleChange}
              className="w-full p-2 outline-none"
              rows={3}
            ></textarea>
          </div>

          <div className="col-span-2 flex justify-end gap-2 mt-2">

            <button
                type="button"
                onClick={() => navigate('/restaurant')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg"
                >
                Cancel
            </button>

            <button type="submit" className="bg-sky-600 hover:bg-sky-800 text-white px-5 py-2 rounded-lg shadow">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const InputWithIcon = ({ icon, name, value, onChange, placeholder = '', type = 'text' }) => (
  <div className="flex items-center border rounded px-2">
    <span className="text-gray-400 mr-2">{icon}</span>
    <input
      name={name}
      value={value}
      type={type}
      placeholder={placeholder || name.charAt(0).toUpperCase() + name.slice(1)}
      onChange={onChange}
      className="w-full p-2 outline-none"
    />
  </div>
);
