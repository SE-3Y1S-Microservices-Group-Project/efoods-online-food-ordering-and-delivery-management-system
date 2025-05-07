const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');

router.post('/send-sms', controller.sendSMSConfirmation);
router.post('/send-email', controller.sendEmailConfirmation);

module.exports = router;
