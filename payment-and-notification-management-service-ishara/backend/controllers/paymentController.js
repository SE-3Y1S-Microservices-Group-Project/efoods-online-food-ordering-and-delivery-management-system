const mongoose = require("mongoose");
require("dotenv").config();

exports.getCheckoutInfo = async (req, res) => {
  const { userId } = req.params;

  const orderDB = req.app.locals.dbs.orderDB;

  const restaurantDB = req.app.locals.dbs.restaurantDB;

  const Order =
    require("../models/Order")(
      orderDB
    );
  const User =
    require("../models/User")(
      orderDB
    );
  const Restaurant =
    require("../models/Restaurant")(
      restaurantDB
    );
  const MenuItem =
    require("../models/MenuItem")(
      restaurantDB
    );

  try {
    const latestOrder = await Order.findOne({ userId }).sort({ createdAt: -1 });
    if (!latestOrder)
      return res.status(404).json({ message: "Order not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    //const savedCards = await Card.find({ userId });

    const itemsWithDetails = await Promise.all(
      latestOrder.items.map(async (item) => {
        console.log(
          `Fetching details for Item: ${item._id}, Restaurant ID: ${item.restaurantId}, MenuItem ID: ${item.menuitemId}`
        );

        // Convert to ObjectId correctly using new keyword
        const restaurant = await Restaurant.findById(
          new mongoose.Types.ObjectId(item.restaurantId)
        );
        const menuItem = await MenuItem.findById(
          new mongoose.Types.ObjectId(item.menuitemId)
        );

        console.log("Fetched Restaurant:", restaurant);
        console.log("Fetched MenuItem:", menuItem);

        return {
          ...item,
          restaurantName: restaurant ? restaurant.name : "Unknown Restaurant",
          menuItemName: menuItem ? menuItem.name : "Unknown Menu Item",
          price: menuItem ? menuItem.price : 0, // Assuming price is part of MenuItem
        };
      })
    );

    res.json({
      order: {
        items: itemsWithDetails,
        totalAmount: latestOrder.totalAmount,
        shippingInfo: latestOrder.shippingInfo,
      },
      customer: {
        firstName: user.firstName,
        lastName: user.lastName,
        contact: user.contact,
        email: user.email,
      },
      // savedCards
    });
  } catch (err) {
    console.error("Checkout fetch error:", err);
    res.status(500).json({ message: "Failed to fetch checkout data" });
  }
};

//Stripe Redirect
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  const { userId, orderId } = req.body;

  try {
    // Fetch order details from your database
    const Order =
      require("../models/Order")(
        req.app.locals.dbs.orderDB
      );
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "E-Foods Order",
            },
            unit_amount: Math.round(order.totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL1}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL2}`,
      metadata: {
        userId: userId.toString(),
        orderId: orderId.toString(),
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe session creation error:", error);
    res.status(500).json({ error: "Failed to create payment session" });
  }
};

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
// Stripe Webhook Handler
exports.handleWebhook = async (req, res) => {
  const sigHeader = req.headers["stripe-signature"];
  const rawBody = req.body;

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sigHeader, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  // Step 2: Handle the event based on the type
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    const stripeSessionId = session.id;
    const paymentStatus = session.payment_status;

    console.log("Stripe session completed:", stripeSessionId, paymentStatus);

    try {
      // Step 3: Validate the Order ID
      const orderDB = req.app.locals.dbs.orderDB;
      const Order =
        require("../models/Order")(
          orderDB
        );

      // Step 4: Fetch the Order from the Database
      const order = await Order.findById(orderId);
      if (!order) {
        console.warn("Order not found:", orderId);
        return res.status(404).json({ message: "Order not found" });
      }

      // Step 5: Update Order Payment Status
      order.isPaid = true;
      console.log("Updating order to paid", order);
      order.paymentInfo = {
        stripeSessionId,
        status: paymentStatus,
        paidAt: new Date(),
      };

      // Step 6: Log Order Before Saving (for debugging)
      console.log(session.payment_status);
      console.log("Order before saving:", order);

      // Step 7: Save the Order in the Database
      try {
        await order.save();
        console.log("Order updated as paid:", orderId);
      } catch (dbErr) {
        console.error("Error saving order to the database:", dbErr.message);
        return res.status(500).json({ error: "Failed to save order" });
      }

      // Save Payment Info to Payment Model
      try {
        const paymentDB = req.app.locals.dbs.paymentDB; // assume you're using separate DB
        const Payment = require("../models/Payment")(paymentDB); // adjust path if needed

        const paymentRecord = new Payment({
          orderId: order._id,
          stripeSessionId,
          amountTotal: session.amount_total / 100, // convert from cents
          currency: session.currency,
          status: paymentStatus,
          paidAt: new Date(),
        });

        await paymentRecord.save();
        console.log("Payment record saved:", paymentRecord._id);
      } catch (paymentSaveErr) {
        console.error("Error saving payment record:", paymentSaveErr.message);
      }

    } catch (err) {
      console.error("Error processing webhook:", err.message);
      return res.status(500).json({ error: "Failed to process webhook" });
    }
  } else {
    console.warn("Unhandled event type:", event.type);
  }

  // Step 9: Respond to Stripe to acknowledge the receipt of the webhook
  res.status(200).json({ received: true });
};

//Get payment session details
exports.getSessionDetails = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      customerName: session.customer_details.name,
      customerEmail: session.customer_details.email,
      amount: session.amount_total,
      status: session.payment_status,
      created: session.created,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Failed to retrieve Stripe session:", error.message);
    res
      .status(500)
      .json({ error: "Failed to retrieve Stripe session details" });
  }
};
