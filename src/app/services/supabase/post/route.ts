import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib";

export async function POST(params: NextRequest) {
  
  const { 
    author,
    question,
    body,
    acc_address
  } = await params.json();

  try {

    const { error } = await supabaseServer
    .from("feeds")
    .insert([{ author, question, body, acc_address, time: new Date().toISOString(), hearts: 0, hearts_record: [] }]);

    if (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: "Something Went Wrong" }, { status: 408 });
    }

    return NextResponse.json({ success: true, message: "Posted Successfully" }, { status: 200 });

  } catch(err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }

}