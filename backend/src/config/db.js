import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        // For local dev, using a local mongodb URI or a mock if user hasn't provided one.
        // The user didn't provide a .env, so I'll check process.env.MONGO_URI or default to local.
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nerdyos');

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
