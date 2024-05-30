import mongoose from "mongoose";

const { Schema } = mongoose;

const BasicOutageDataSchema = new Schema({
  partido: {
    type: String,
    required: true,
  },
  localidad: {
    type: String,
    required: true,
  },
  afectados: {
    type: Number,
    required: true,
  },
});

const OutageDataWithETASchema = new Schema({
  partido: {
    type: String,
    required: true,
  },
  localidad: {
    type: String,
    required: true,
  },
  afectados: {
    type: Number,
    required: true,
  },
  eta: {
    type: String,
    required: true,
  },
});



const mainSchema = new Schema({
  edesur: {
    mt: [OutageDataWithETASchema],
    bt: [BasicOutageDataSchema],
  },
  edenor: {
      mt: [OutageDataWithETASchema],
      bt: [BasicOutageDataSchema],
  }
});

export default mongoose.models.Outage ||
  mongoose.model("Outage", mainSchema)
