import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Mongoose connection options
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are recommended for modern MongoDB drivers
      useNewUrlParser: true,          // Parse connection strings using new parser
      useUnifiedTopology: true,        // Use new server discovery and monitoring engine
      
      // Optional additional configurations
      serverSelectionTimeoutMS: 5000,  // Timeout for server selection
      socketTimeoutMS: 45000,          // How long a send or receive can take before timing out
      family: 4                        // Use IPv4, skip trying IPv6
    });

    // Log successful connection with host and database name
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    
    // Optionally log the database name
    console.log(`Database Name: ${conn.connection.db.databaseName}`.cyan);

    return conn;
  } catch (error) {
    // Log connection error in red
    console.error(`Error: ${error.message}`.red.bold);
    
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;