import mongoose from "mongoose";

const connect = async () => {
  if (mongoose.connections[0].readyState) {
    // Already connected
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO as string, {
      // optional: you can add useNewUrlParser and useUnifiedTopology if needed
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Connection failed!");
  }
};

export default connect;
