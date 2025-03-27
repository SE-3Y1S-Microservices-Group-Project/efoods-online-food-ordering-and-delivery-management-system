const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 10
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function() {
            //only required for local authentications
            return !this.googleId;
        },
        minlength: 6
    },
    googleId: {
        type: String,
        unique: true,
        //alllows mutiple null values
        sparse: true
    },
    firstName: {
        type : String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    avatar: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    loginType: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    }
}, { 
    timestamps: true 
});

//add index for efficient querying
//ensure that email is unique for fast lookups
//userSchema.index({ email: 1}, { unique: true });

//crate an indx on googleId to speed up search for oauth useres
//sparse option ensures that users without googleId have null values
//userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);