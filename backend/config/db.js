import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // For development, use a fallback connection if MONGO_URI fails
    let connectionString = process.env.MONGO_URI;
    
    // If no MONGO_URI or connection fails, use a mock/in-memory setup
    if (!connectionString) {
      console.log('No MONGO_URI found, using fallback connection...');
      connectionString = 'mongodb://localhost:27017/shopwave_dev';
    }
    
    const connection = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB connected successfully on host: ${connection.connection.host}, database: ${connection.connection.db.databaseName}`);
    return connection;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    
    // For development, continue without crashing
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Continuing without database connection...');
      return null;
    }
    
    process.exit(1);
  }
};

export default connectDB;
