import dbConnect from '@/lib/mongodb';
import Wish from '@/models/Wish';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const wishes = await Wish.find().sort({ createdAt: -1 });
    return res.status(200).json(wishes);
  }

  if (req.method === 'POST') {
    const { title, description, category } = req.body;
    const wish = await Wish.create({ title, description, category });
    return res.status(200).json(wish);
  }

   if (req.method === 'PUT') {
    const { id, taken, takenBy, quantity } = req.body;

    try {
      const wish = await Wish.findById(id);

      if (!wish) {
        return res.status(404).json({ message: 'Wish not found' });
      }

      // Update the wish with takenBy and quantity
      wish.taken = taken;
      wish.takenBy = takenBy;
      wish.quantity = quantity; // Update quantity

      await wish.save(); // Save the updated wish

      return res.json(wish);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating wish' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    await Wish.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Wish deleted' });
  }

  res.status(405).end();
}
