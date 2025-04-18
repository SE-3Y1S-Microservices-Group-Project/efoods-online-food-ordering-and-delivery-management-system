//add item to cart or update quantity
exports.addItemToCart = async (req, res) => {
    const { orderDB } = req.app.locals.dbs;
    const Cart = require('../models/Cart')(orderDB);

    const { userId, restaurantId, menuItemId, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ userId });
        if (cart) {
            //check product already in the cart
            const itemIndex = cart.items.findIndex(
                (item) => 
                    item.menuItemId.toString() === menuItemId &&
                    item.restaurantId.toString() === restaurantId
            );

            if (itemIndex > -1) {
                //update quantity
                cart.items[itemIndex].quantity += quantity;
            } else {
                //add new item
                cart.items.push({ restaurantId, menuItemId, quantity });
            }
            await cart.save();
            res.json(cart);
        } else {
            //create new cart
            const newCart = await Cart.create({
                userId,
                items: [{ restaurantId, menuItemId, quantity }],
            });
            res.status(201).json(newCart);
            console.log('Item added to cart successfully');
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

//get cart items
exports.getCartItems = async (req, res) => {
    const { orderDB, restaurantDB } = req.app.locals.dbs;
    const Cart = require('../models/Cart')(orderDB);
    const Restaurant = require('../../../restaurant-management-service-neranda/backend/models/Restaurant')(restaurantDB);
    const MenuItem = require('../../../restaurant-management-service-neranda/backend/models/MenuItem')(restaurantDB);

    try {
        const cart = await Cart.findOne({ userId: req.params.userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        const enrichedItems = await Promise.all(
            cart.items.map(async (item) => {
                const restaurant = await Restaurant.findById(item.restaurantId);
                const menuItem = await MenuItem.findById(item.menuItemId);

                return {
                    ...item.toObject(),
                    restaurant,
                    menuItem,
                };
            })
        );

        res.json({ ...cart.toObject(), items: enrichedItems });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message});
    }
};

//update quantity for specific items
exports.updateItemQuantity = async (req, res) => {
    const { orderDB } = req.app.locals.dbs;
    const Cart = require('../models/Cart')(orderDB);

    const { restaurantId, menuItemId, quantity } = req.body;

    try {
        const cart = await Cart.findOne({ userId: req.params.userId });

        const item = cart.items.find(
            (item) =>
                item.menuItemId.toString() === menuItemId &&
                item.restaurantId.toString() === restaurantId
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
    const { orderDB } = req.app.locals.dbs;
    const Cart = require('../models/Cart')(orderDB);

    const { restaurantId, menuItemId } = req.params;

    try {
        const cart = await Cart.findOne({ userId: req.params.userId });

        cart.items = cart.items.filter(
            (item) =>
                item.menuItemId.toString() !== menuItemId ||
                item.restaurantId.toString() !== restaurantId
        );

        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



