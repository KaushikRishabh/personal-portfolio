import { db } from "../../firebase";

export default async function handler(req, res) {
  const docRef = db.collection("visitors").doc("count");
  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    const newCount = doc.exists ? doc.data().count + 1 : 1;
    transaction.set(docRef, { count: newCount });
  });
  res.status(200).json({ message: "Visitor count incremented" });
}
