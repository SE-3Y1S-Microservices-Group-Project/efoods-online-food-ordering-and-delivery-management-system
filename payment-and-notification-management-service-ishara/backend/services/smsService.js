const twilio = require('twilio');
require('dotenv').config();

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: process.env.TO_PHONE,
    });
    console.log('SMS sent:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    throw error;
  }
};

module.exports = { sendSMS };
