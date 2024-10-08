const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        default: null
    }
})

module.exports = mongoose.model("User", userSchema);