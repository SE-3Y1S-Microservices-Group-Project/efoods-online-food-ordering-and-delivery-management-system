const mongoose = require('mongoose');

const connectDB = async () => {
    //handle connecting error
    try {
        //extablished a connection to mongodb using environment variables
        const conn = await mongoose.connect(process.env.MONGO_URI);

        //provide hostname of he connection server
        console.log(`MongoDB Connected.`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        //when db fails, ensure applications stops
        process.exit(1);
    }
}

module.exports = connectDB;