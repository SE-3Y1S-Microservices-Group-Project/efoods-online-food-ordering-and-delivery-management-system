import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/SideBar';
import axios from 'axios';
import MenuForm from './MenuForm';
import { FilePlus, FileText, Download, Pencil, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/menu');
      setMenuItems(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching menu items:', err);
    }
  };

  const handleExportExcel = () => {
    const data = menuItems.map(({ name, category, price, discount, stock, isAvailable }) => ({
      Name: name,
      Category: category,
      Price: price,
      Discount: discount,
      Stock: stock,
      Available: isAvailable ? 'Yes' : 'No',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MenuItems');
    XLSX.writeFile(wb, 'MenuItems.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const rows = menuItems.map(item => [
      item.name, item.category, `Rs. ${item.price}`, `${item.discount}%`, item.stock, item.isAvailable ? 'Yes' : 'No'
    ]);
    doc.autoTable({
      head: [['Name', 'Category', 'Price', 'Discount', 'Stock', 'Available']],
      body: rows
    });
    doc.save('MenuItems.pdf');
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-sky-700">Menu Items</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900"
          >
            <FilePlus className="mr-2" size={18} /> Add New Menu
          </button>
        </div>

        {showForm && (
          <MenuForm
            onClose={() => setShowForm(false)}
            onSuccess={fetchMenuItems}
            restaurantId={"your-restaurant-id"}
          />
        )}

        <div className="flex justify-between mb-4 flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search by name/category..."
            className="border px-3 py-2 rounded w-full md:w-1/3"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={handleExportExcel} className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-800">
              Export Excel
            </button>
            <button onClick={handleExportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800">
              Export PDF
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading menu items...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:ring ring-sky-200 transition"
                onClick={() => setSelectedItem(item)}
              >
                {item.image?.[0] ? (
                  <img
                    src={`http://localhost:5000/${item.image[0]}`}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800">{item.name}</h2>
                  <p className="text-sm text-gray-500">{item.category}</p>
                  <p className="mt-2 font-bold text-sky-600">Rs. {item.price}</p>
                  <p className="text-sm">Discount: {item.discount || 0}%</p>
                  <p className="text-sm">Stock: {item.stock || 0}</p>
                  <span
                    className={`inline-block px-2 py-1 mt-2 text-xs font-semibold rounded-full ${
                      item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  <div className="flex justify-end gap-2 mt-4">
                    <button className="text-yellow-600 hover:text-yellow-800">
                      <Pencil size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal with detailed view */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-xl w-full relative">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
              >
                ✖
              </button>
              <h2 className="text-2xl font-bold mb-4">{selectedItem.name}</h2>
              <p><strong>Category:</strong> {selectedItem.category}</p>
              <p><strong>Price:</strong> Rs. {selectedItem.price}</p>
              <p><strong>Discount:</strong> {selectedItem.discount}%</p>
              <p><strong>Description:</strong> {selectedItem.description}</p>
              <p><strong>Ingredients:</strong> {selectedItem.ingredients?.join(', ')}</p>
              <p><strong>Tags:</strong> {selectedItem.tags?.join(', ')}</p>
              <p><strong>Sizes:</strong> {selectedItem.sizes?.map(s => `${s.size} (Rs. ${s.price})`).join(', ')}</p>
              <p><strong>Add-ons:</strong> {selectedItem.addOns?.map(a => `${a.name} (Rs. ${a.price})`).join(', ')}</p>
              <p><strong>Prep Time:</strong> {selectedItem.prepTime} min</p>
              <p><strong>Available:</strong> {selectedItem.isAvailable ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
