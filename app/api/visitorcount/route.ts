import { db } from "../../../lib/firebase/config"; // Adjust the path based on your project structure
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const docRef = doc(db, "visitors", "count");

  try {
    // console.log("db", db);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.log("No such document!");
      throw new Error("No visitor count found");
    }
    // console.log("docSnap", docSnap);
    const docData = docSnap.data();
    // console.log("docData", docData);
    // Using NextResponse to return the response
    return new NextResponse(JSON.stringify(docData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Error fetching visitor count" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
