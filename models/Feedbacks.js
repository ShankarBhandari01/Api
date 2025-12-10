import { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const feedbackSchema = new Schema({
  uuid: {
    type: String,
    default: uuidv4,
    index: true,
    unique: true,
  },
  reviewer_name: {
    type: String,
    default: "anonymous",
    trim: true,
  },
  message: {
    type: String,
    trim: true,
    required: false,
    minlength: 1,
    maxlength: 1000
  },
  star: {
    type: Number,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: "Star rating must be an integer",
    },
  },
  uuid: { type: String, default: uuidv4 },
}, {
  timestamps: true,           // createdAt, updatedAt
  versionKey: false,          // no __v
  strict: true,               // ignore fields not in the schema
})
feedbackSchema.index({ createdAt: -1 });

export default (connection) => connection.model("Feedback", feedbackSchema)