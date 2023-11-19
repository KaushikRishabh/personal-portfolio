// app/api/visitorCount.js

import { db } from "../../firebase"; // Adjust the path based on your project structure

export default async function handler(req, res) {
  const docRef = db.collection("visitors").doc("count");

  try {
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error("No visitor count found");
    }
    const count = doc.data().count;
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: "Error fetching visitor count" });
  }
}
