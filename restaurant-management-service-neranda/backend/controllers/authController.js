
// const User = require('../models/userModel')
// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')

// exports.register = async (req, res) => {
//   const { name, email, password } = req.body
//   try {
//     const existing = await User.findOne({ email })
//     if (existing) return res.status(400).json({ message: 'Email already exists' })

//     const hashed = await bcrypt.hash(password, 10)
//     const newUser = new User({ name, email, password: hashed })
//     await newUser.save()
//     res.status(201).json({ message: 'User registered successfully' })
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// }

// exports.login = async (req, res) => {
//   const { email, password } = req.body
//   try {
//     const user = await User.findOne({ email })
//     if (!user) return res.status(404).json({ message: 'User not found' })

//     const isMatch = await bcrypt.compare(password, user.password)
//     if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
//     res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } })
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// }


const Restaurant = require('../models/Restaurant')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
  const { name, email, password, contact } = req.body

  try {
    const existing = await Restaurant.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already exists' })

    const hashed = await bcrypt.hash(password, 10)

    const newRestaurant = new Restaurant({
      name,
      email,
      password: hashed,
      contact,
      status: 'pending' // default status
    })

    await newRestaurant.save()

    res.status(201).json({ message: 'Restaurant registered successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body

  try {
    const restaurant = await Restaurant.findOne({ email })

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' })
    }

    const isMatch = await bcrypt.compare(password, restaurant.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: restaurant._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    })

    res.status(200).json({
      token,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        email: restaurant.email,
        status: restaurant.status
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
