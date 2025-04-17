// routes/card.js
const express = require('express');
const router = express.Router();
const SavedCard = require('../models/SavedCard');

router.get('/:customerId', async (req, res) => {
  try {
    const cards = await SavedCard.find({ customerId: req.params.customerId });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching saved cards' });
  }
});

router.post('/save', async (req, res) => {
    try {
      const { customerId, cardHolderName, cardNumber, expiryMonth, expiryYear } = req.body;
  
      const savedCard = new SavedCard({
        customerId,
        cardHolderName,
        cardNumber, // consider storing last 4 digits only
        expiryMonth,
        expiryYear
      });
  
      await savedCard.save();
      res.status(200).json({ message: 'Card saved successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error saving card' });
    }
  });
  

module.exports = router;
