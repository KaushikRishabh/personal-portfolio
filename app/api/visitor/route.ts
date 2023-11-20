import { db } from "../../../lib/firebase/config";
import { doc, runTransaction, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const docRef = doc(db, "visitors", "count");

  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(docRef);
    const newCount = docSnap.exists() ? docSnap.data().count + 1 : 1;
    transaction.set(docRef, { count: newCount });
  });

  // Note: Using NextResponse to return the response
  return new NextResponse(
    JSON.stringify({ message: "Visitor count incremented" }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
