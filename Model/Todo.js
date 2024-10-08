const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user
    description: { type: String, required: true }, // Description of the task
    completed: { type: Boolean, default: false }, // Status of the task
    dueDate: { type: Date }, // Optional due date for the task
    createdAt: { type: Date, default: Date.now } // Timestamp when the task was created
});

// Exporting the Todo model
module.exports = mongoose.model("Todo", todoSchema);
