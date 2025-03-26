const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Register
router.post('/register', async (req, res) => {
    try {
        const {name, email, address, password, conact, description, image, menu, deliveryFee, status} = req.body;
        const hash = await bcrypt.hash(password, 10);
        const restaurant = new Restaurant({ name, email, address, password: hash, conact, description, image, menu, deliveryFee, status });
        await restaurant.save();
        res.json({message: "Registration submitted for Approval.."});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async(req, res) => {
    try{
        const {email, password} = req.body;
        const restaurant = await Restaurant.findOne({email});
        if(!restaurant) return res.status(400).json({error: "Not Found !"});

        const isMatch = await bcrypt.compare(password, restaurant.password);
        if(!isMatch) return res.status(401).json({error: "Invalid Credentials !"});

        const token = jwt.sign({id: restaurent._id}, process.env.JWT_SECRET, {expiresIn: peocess.env.JWT_EXPIRES_IN});
    }catch(error){
        res.status(500).json({ error: error.message});
    }
});

// Toggle Availability
router.put('/:id/availability', async (req, res) => {
    const { isAvailable } = req.body;
    const updated = await Restaurant.findByIdAndUpdate(req.params.id, { isAvailable }, { new: true });
    res.json(updated);
  });

// Get Restaurant Info
router.get('/:id', async(req, res) => {
    const restaurent = await Restaurant.findById(req.params.id);
    res.json(restaurent);
});

module.exports = router;