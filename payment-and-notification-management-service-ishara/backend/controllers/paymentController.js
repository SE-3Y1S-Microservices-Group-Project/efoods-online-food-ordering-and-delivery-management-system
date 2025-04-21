const mongoose = require("mongoose");

//Fetch data to the heckout page
exports.getCheckoutInfo = async (req, res) => {
  const { userId } = req.params;

  const orderDB = req.app.locals.dbs.orderDB;
  const paymentDB = req.app.locals.dbs.paymentDB;

  const Order = require("../../../order-management-service-sasin/backend/models/Order")(orderDB);
  const User = require("../../../order-management-service-sasin/backend/models/User")(orderDB);
  const Card = require("../models/Card")(paymentDB);

  try {
    const latestOrder = await Order.findOne({ userId }).sort({ createdAt: -1 });
    if (!latestOrder) return res.status(404).json({ message: "Order not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const savedCards = await Card.find({ userId });

    res.json({
      order: {
        items: latestOrder.items,
        totalAmount: latestOrder.totalAmount,
        shippingInfo: latestOrder.shippingInfo
      },
      customer: {
        firstName: user.firstName,
        lastName: user.lastName,
        contact: user.contact,
        email: user.email
      },
      savedCards
    });

  } catch (err) {
    console.error("Checkout fetch error:", err);
    res.status(500).json({ message: "Failed to fetch checkout data" });
  }
};


// //Add New Card
// exports.addCard = async (req, res) => {
//   const { userId, cardNumber, expiryDate, cvv } = req.body;

//   if (!userId || !cardNumber || !expiryDate || !cvv) {
//     return res.status(400).json({ message: "All card fields are required" });
//   }

//   const paymentDB = req.app.locals.dbs.paymentDB;
//   const Card = require("../models/Card")(paymentDB);

//   try {
//     const newCard = new Card({ userId, cardNumber, expiryDate, cvv });
//     await newCard.save();

//     res.status(201).json({ message: "Card saved successfully", card: newCard });
//   } catch (err) {
//     console.error("Add card error:", err);
//     res.status(500).json({ message: "Failed to save card" });
//   }
// };


//Redirect user to PayHere for payment
exports.processPayment = async (req, res) => {
  const { userId, orderId, cardId } = req.body;

  const Order = require("../../../order-management-service-sasin/backend/models/Order")(req.app.locals.dbs.orderDB);
  const User = require("../../../order-management-service-sasin/backend/models/User")(req.app.locals.dbs.orderDB);
  const Card = require("../models/Card")(req.app.locals.dbs.paymentDB);

  try {
    // Fetch order and user
    const order = await Order.findById(orderId);
    const user = await User.findById(userId);

    if (!order || !user) {
      return res.status(404).json({ message: "Order or user not found" });
    }

    // Optional: validate saved card if selected
    if (cardId) {
      const savedCard = await Card.findOne({ _id: cardId, userId });
      if (!savedCard) {
        return res.status(404).json({ message: "Saved card not found" });
      }
    }

    // Build payment form data
    const form = {
      merchant_id: process.env.PAYHERE_MERCHANT_ID,
      return_url: process.env.PAYHERE_RETURN_URL,
      cancel_url: process.env.PAYHERE_CANCEL_URL,
      notify_url: process.env.PAYHERE_NOTIFY_URL,
      order_id: order._id.toString(),
      items: "E-Foods Order",
      amount: order.totalAmount.toFixed(2),
      currency: "LKR",
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      phone: user.contact,
      address: order.shippingInfo.address,
      city: order.shippingInfo.city,
      country: order.shippingInfo.country,
    };

    // Auto-submit HTML form
    const formHtml = `
      <html>
        <body>
          <form id="payhere-form" method="post" action="https://sandbox.payhere.lk/pay/checkout">
            ${Object.entries(form)
              .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
              .join("")}
          </form>
          <script>document.getElementById('payhere-form').submit();</script>
        </body>
      </html>
    `;

    res.send(formHtml);
  } catch (error) {
    console.error("Error during payment redirect:", error);
    res.status(500).json({ message: "Failed to process payment" });
  }
};



//Handle PayHere Payment Notification
exports.notifyPayment = async (req, res) => {
  try {
      const { paymentDB, orderDB } = req.app.locals.dbs;
      const Transaction = require('../models/Payment')(paymentDB); // Your Payment model
      const Order = require('../../../order-management-service-sasin/backend/models/Order')(orderDB); // Order from order service
      const User = require('../../../order-management-service-sasin/backend/models/User')(orderDB); // User from order service
      const FailedLog = require('../models/FailedTransactionLog')(paymentDB);

      // Destructure required fields from PayHere POST notification
      const { order_id, status_code, payment_id } = req.body;

      // Find the transaction by the order_id provided by PayHere
      const transaction = await Transaction.findOne({ orderId: order_id });

      if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
      }

      // Update transaction status based on status_code from PayHere
      transaction.status = status_code === "2" ? "Completed" : "Failed";

      // Save the PayHere-generated payment ID for future traceability
      transaction.paymentId = payment_id;

      // Save the updated transaction in the database
      await transaction.save();

      // Optional: Update the related order as paid if status is successful
      if (status_code === "2") {
          const order = await Order.findById(transaction.orderId);
          if (order) {
              order.isPaid = true;
              order.paidAt = new Date();
              await order.save();
          }

          // Send confirmation email
          const user = await User.findById(transaction.userId);
          if (user) {
              await sendConfirmationEmail(user.email, user.firstName, transaction);
          }
      } else {
          // Log failed transaction for auditing
          await FailedLog.create({
              orderId: transaction.orderId,
              userId: transaction.userId,
              paymentId: payment_id,
              statusCode: status_code,
              reason: "Payment failed or rejected",
              receivedAt: new Date()
          });
      }

      // Send success response to PayHere
      res.status(200).json({ message: 'Payment notification processed successfully' });
  } catch (error) {
      console.error("Error in notifyPayment:", error.message);
      res.status(500).json({ message: "Server error while processing payment notification" });
  }
};

// Helper: Send confirmation email
const sendConfirmationEmail = async (toEmail, userName, transaction) => {
  try {
      const transporter = nodemailer.createTransport({
          service: 'gmail', // or use Mailgun, SendGrid, etc.
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
          }
      });

      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: toEmail,
          subject: 'eFoods - Payment Successful',
          html: `
              <h3>Hello ${userName},</h3>
              <p>Thank you for your order. Your payment was successfully processed.</p>
              <p><strong>Order ID:</strong> ${transaction.orderId}</p>
              <p><strong>Payment ID:</strong> ${transaction.paymentId}</p>
              <p>We hope you enjoy your meal!</p>
              <br>
              <p>— eFoods Team</p>
          `
      };

      await transporter.sendMail(mailOptions);
      console.log(` Confirmation email sent to ${toEmail}`);
  } catch (err) {
      console.error(" Failed to send confirmation email:", err.message);
  }
};


// Get saved cards for a specific user
exports.getSavedCards = async (req, res) => {
  const { userId } = req.params;
  const Card = require("../models/Card")(req.app.locals.dbs.paymentDB);

  try {
    const cards = await Card.find({ userId });

    if (!cards.length) {
      return res.status(404).json({ message: "No saved cards found." });
    }

    res.status(200).json(cards);
  } catch (error) {
    console.error("Error fetching saved cards:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Save a new card for the user

exports.saveNewCard = async (req, res) => {
  const Card = require("../models/Card")(req.app.locals.dbs.paymentDB);
  const { userId, cardNumber, expiryDate, cardHolderName } = req.body;

  try {
    // Validate required fields
    if (!userId || !cardNumber || !expiryDate || !cardHolderName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Mask the card number for security (store only last 4 digits)
    const maskedCardNumber = "************" + cardNumber.slice(-4);

    // Save the card
    const newCard = new Card({
      userId,
      cardNumber: maskedCardNumber,
      expiryDate,
      cardHolderName,
    });

    await newCard.save();
    res.status(201).json({ message: "Card saved successfully", card: newCard });
  } catch (error) {
    console.error("Error saving card:", error);
    res.status(500).json({ message: "Server error" });
  }
};
