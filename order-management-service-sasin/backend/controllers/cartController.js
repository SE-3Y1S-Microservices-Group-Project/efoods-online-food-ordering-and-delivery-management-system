const Cart = require('../models/Cart');

//add item to cart or update quantity
exports.addItemToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        let cart = await Cart.findOne({ userId });
        if (cart) {
            //check product already in the cart
            const itemIndex = cart.items.findIndex(
                (item) => item.productId.toString() === productId
            );

            if (itemIndex > -1) {
                //update quantity
                cart.items[itemIndex].quantity += quantity;
            } else {
                //add new item
                cart.items.push({ productId, quantity });
            }
            await cart.save();
            res.json(cart);
        } else {
            //create new cart
            const newCart = await Cart.create({
                userId,
                items: [{ productId, quantity }],
            });
            res.status(201).json(newCart);
            console.log('Item added to cart successfully');
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//get cart items
exports.getCartItems = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId }).populate(
            'items.productId'
        );
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
};

//update quantity for specific items
exports.updateItemQuantity = async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        const item = cart.items.find(
            (item) => item.productId.toString() === productId
        );
        if (item) {
            item.quantity = quantity;
            await cart.save();
            res.json(cart);
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (err) {
        res.status(404).json({ message: 'Item not found in cart' });
    }
};

//remove item from cart
exports.removeCartItem = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        cart.items = cart.items.filter(
            (item) => item.productId.toString() !== req.params.productId
        );
        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



