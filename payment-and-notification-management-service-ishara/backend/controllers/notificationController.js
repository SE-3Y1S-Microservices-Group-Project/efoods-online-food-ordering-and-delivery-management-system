const { sendSMS } = require('../services/smsService');
const sendEmail = require('../services/emailService');


const sendSMSConfirmation = async (req, res) => {
  try {
    const { orderId } = req.body;
    const message = `Your E-Foods order ${orderId} has been placed successfully! 🍽️`;
    await sendSMS(message);
    res.status(200).json({ message: 'SMS sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendEmailConfirmation = async (req, res) => {
  const { orderId, toEmail } = req.body;

  try {
    const subject = `e-Foods Order Confirmation - ${orderId}`;
    const htmlContent = `<h1>Thank you for your e-Foods order!</h1><p>Your order ID is <strong>${orderId}</strong>.</p>`;

    await sendEmail(subject, htmlContent, toEmail);

    console.log("Email sent to:", toEmail);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error("Email send failed:", error);
    res.status(500).json({ error: 'Failed to send email' });
  }
};


module.exports = { sendSMSConfirmation, sendEmailConfirmation };
