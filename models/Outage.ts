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

const outageSchema = new Schema(
  {
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
  },
  { timestamps: true }
);

const commentSchema = new Schema({
  name: String,
  email: String,
  text: String,
  date: String,

})

const mainSchema = new Schema({
  edesur: {
    programados: [OutageDataWithETASchema],
    mt: [OutageDataWithETASchema],
    bt: [BasicOutageDataSchema],
  },
  edenor: {
      programados: [OutageDataWithETASchema],
      mt: [OutageDataWithETASchema],
      bt: [BasicOutageDataSchema],
  }
});

export default mongoose.models.Outage ||
  mongoose.model("Outage", mainSchema)
