import mongoose from 'mongoose';

const WishSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  category: { type: String, required: true },
  taken: { type: Boolean, default: false },
  quantity: { type: Number, default: 1 },
  takenBy: { type: String, required: false },
}, { timestamps: true });

export default mongoose.models.Wish || mongoose.model('Wish', WishSchema);
