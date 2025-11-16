import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    brandName: {
      type: String,
      default: "apple",
    },
    timeline:{
      type: String,
      enum: ["year", "month"],
      default: "year", // optional default
    }

  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
