// backend/routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// Create
router.post('/', async (req, res) => {
  const item = new MenuItem(req.body);
  await item.save();
  res.json(item);
});

// Read
router.get('/:restaurantId', async (req, res) => {
  const items = await MenuItem.find({ restaurantId: req.params.restaurantId });
  res.json(items);
});

// Update
router.put('/:id', async (req, res) => {
  const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete
router.delete('/:id', async (req, res) => {
  await MenuItem.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
