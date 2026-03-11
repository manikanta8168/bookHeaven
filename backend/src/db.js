import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoUri =
            process.env.MONGO_URI ||
            process.env.MONGODB_URL ||
            'mongodb://localhost:27017/bookstore';
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
