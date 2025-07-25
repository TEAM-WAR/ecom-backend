import mongoose from "mongoose";

const Transaction = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: [true, "La quantité est requise"],
    },
    type: {
      type: String,
      enum: ["entree", "sortie"],
      required: [true, "Le type de transaction est requis"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Transaction", Transaction);
