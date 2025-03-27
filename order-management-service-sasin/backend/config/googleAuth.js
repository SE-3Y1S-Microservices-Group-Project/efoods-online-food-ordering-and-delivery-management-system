//import oauth2client clas from google auth library
const { OAuth2Client } = require('google-auth-library');

//create instance of oauth2client
const clinet = new OAuth2Client(
    //google clinet id, clinet secret and redirect uri from env
    process.env.GOOGLR_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage'
);

module.exports = clinet;