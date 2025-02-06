import mongoose from 'mongoose';

const connectMongo = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI!);

    // 0- disconnected, 1- connected, 2- connecting, 3- disconnecting
    if (connection.readyState == 1) {
      return Promise.resolve(true);
    }
  } catch (err) {
    return Promise.reject(err);
  }
};

export default connectMongo;
