const MenuItem = require('../models/MenuItem')

exports.getAll = async (req, res) => {
  const items = await MenuItem.find()
  res.json(items)
}

exports.getOne = async (req, res) => {
  const item = await MenuItem.findById(req.params.id)
  res.json(item)
}

exports.create = async (req, res) => {
  const newItem = new MenuItem(req.body)
  await newItem.save()
  res.status(201).json(newItem)
}

exports.update = async (req, res) => {
  const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(updated)
}

exports.remove = async (req, res) => {
  await MenuItem.findByIdAndDelete(req.params.id)
  res.json({ message: 'Item deleted' })
}
