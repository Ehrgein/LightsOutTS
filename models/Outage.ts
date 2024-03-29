import mongoose from "mongoose";
import { Basic } from "next/font/google";

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

const mainSchema = new Schema({
  edesur: {
    programados: [OutageDataWithETASchema],
    mt: [OutageDataWithETASchema],
    bt: [BasicOutageDataSchema],
  },
});

export default mongoose.models.Outage ||
  mongoose.model("Outage", BasicOutageDataSchema);
