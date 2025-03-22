const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const packageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the sender (customer or employee)
    required: true,
  },
  recipientName: {
    type: String,
    required: true,
  },
  recipientPhone: {
    type: String,
    required: true,
  },
  recipientEmail: {
    type: String,
  },

  description: {
    type: String,
    required: true,
  },

  deliveryAddress: {
    type: String,
    required: true,
  },
  pickupAddress: {
    type: String,
    required: true,
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  pickupDate: {
    type: Date,
    required: true,
  },
  deliveryStatus: {
    type: String,
    enum: ["Pending", "In Transit", "Delivered", "Cancelled"],
    default: "Pending",
  },

  paymentStatus: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Unpaid",
  },

  deliveryPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the delivery person (User with role "delivery partner")
  },
});

packageSchema.plugin(AutoIncrement, {
  inc_field: "packageId", // Field to auto-increment
  id: "packageIdSeq", // Unique ID for the sequence
  start_seq: 1111, // Starting sequence number
});

module.exports = mongoose.model("Package", packageSchema);
