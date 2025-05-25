import { Schema } from "mongoose";

const AppConfigSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ["cors_whitelist"], // Expandable
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function (v) {
          if (this.key === "cors_whitelist") {
            return (
              Array.isArray(v) && v.every((item) => typeof item === "string")
            );
          }
          return true;
        },
        message: "Value for cors_whitelist must be an array of strings",
      },
    },
  },
  {
    timestamps: true,
  }
);

AppConfigSchema.statics.getByKey = async function (key) {
  const result = await this.findOne({ key }).select("value").lean();
  return result?.value ?? null;
};

export default (conn) => conn.model("AppConfig", AppConfigSchema);
