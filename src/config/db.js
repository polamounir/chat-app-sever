import mongoose from 'mongoose';



const connectDB = async () => {
  const dbUrl = process.env.DATABASE_URL;
  console.log(dbUrl , "DDDDDDDDDDDDDD");
  try {
    // const conn = await mongoose.connect('mongodb://localhost:27017/chat-app');
    const conn = await mongoose.connect(dbUrl);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
