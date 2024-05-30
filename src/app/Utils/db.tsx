import mongoose, { ConnectOptions } from "mongoose";

//asdwow123 pwd
const newUri =
  "mongodb+srv://alek:asdwow123@lightsout.qewrqjg.mongodb.net/edesur_data";

const connect = async () => {
  try {
    await mongoose.connect(newUri, {
      dbName: "edesur_data",
    });

    console.log("connection succesful");
  } catch (err) {
    throw new Error("Error in connecting to MongoDB");
  }
};

export default connect;
