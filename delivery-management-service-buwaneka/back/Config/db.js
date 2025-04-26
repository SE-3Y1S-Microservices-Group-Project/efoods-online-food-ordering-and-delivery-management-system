import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
  try {
    // Connect to the main database for your driver service
    const conn = await mongoose.connect(process.env.deliveryServiceDB_MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });

    // Connect to other microservice databases
    const orderDB = await mongoose.createConnection(process.env.orderServiceDB_MONGO_URI);
    const restaurantDB = await mongoose.createConnection(process.env.restaurantServiceDB_MONGO_URI);
    const paymentDB = await mongoose.createConnection(process.env.paymentServiceDB_MONGO_URI);

    // Add error listeners
    orderDB.on('error', (err) => {
      console.error('Error connecting to Order DB:'.red, err);
    });

    // Check if the connections are successful
    orderDB.once('open', () => {
      console.log('Order DB connected successfully'.cyan);
      console.log(`Order Service DB Connected: ${orderDB.name}`.cyan);
    });

    // Define Order Schema based on the other microservice's schema
    const OrderSchema = new mongoose.Schema({
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      },
      items: [
        {
          restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Restaurant'
          },
          menuitemId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'MenuItem'
          },
          quantity: {
            type: Number,
            required: true
          },
        },
      ],
      shippingInfo: {
        address: {
          type: String,
          required: true
        },
        city: {
          type: String,
          required: true
        },
        postalCode: {
          type: String,
          required: true
        },
        country: {
          type: String,
          required: true
        },
      },
      totalAmount: {
        type: Number,
        required: true
      },
      isPaid: {
        type: Boolean,
        default: false
      },
      paidAt: {
        type: Date
      },
    }, {
      timestamps: true
    });

    // Create Order model
    const Order = orderDB.models.Order || orderDB.model('Order', OrderSchema);

    // Log successful connections
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    console.log(`Database Name: ${conn.connection.db.databaseName}`.cyan);

    return {
      conn,
      orderDB,
      restaurantDB,
      paymentDB,
      Order
    };
  } catch (error) {
    // Log connection error in red
    console.error(`Error: ${error.message}`.red.bold);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;

