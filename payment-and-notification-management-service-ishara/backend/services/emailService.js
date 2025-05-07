const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body content
 * @param {string} toEmail - Recipient email address
 */
const sendEmail = async (subject, html, toEmail) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: toEmail,
    subject,
    html, 
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to", toEmail);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
