import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user", select: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    cart: [cartItemSchema]
  },
  { timestamps: true }
);

userSchema.pre("save", async function save() {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function matchPassword(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
