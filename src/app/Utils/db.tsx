import mongoose from "mongoose";

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("connection succesful");
  } catch (err) {
    throw new Error("Error in connecting to MongoDB");
  }
};

export default connect;
